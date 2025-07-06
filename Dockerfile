##################
# BUILD BASE IMAGE
##################

FROM node:20-alpine AS base

# Accept optional custom registry (default is empty)
ARG CUSTOM_REGISTRY=

# Install and use pnpm
RUN npm install -g pnpm

# Optionally set custom registry if provided
RUN if [ -n "$CUSTOM_REGISTRY" ]; then \
      pnpm config set registry "$CUSTOM_REGISTRY"; \
    fi


#############################
# BUILD FOR LOCAL DEVELOPMENT
#############################

FROM base As development
WORKDIR /app
RUN chown -R node:node /app

COPY --chown=node:node package*.json pnpm-lock.yaml ./

# Install all dependencies (including devDependencies)
RUN pnpm install

# Bundle app source
COPY --chown=node:node . .

# Use the node user from the image (instead of the root user)
USER node

#####################
# BUILD BUILDER IMAGE
#####################

FROM base AS builder
WORKDIR /app

COPY --chown=node:node package*.json pnpm-lock.yaml ./
COPY --chown=node:node --from=development /app/node_modules ./node_modules
COPY --chown=node:node --from=development /app/src ./src
COPY --chown=node:node --from=development /app/tsconfig.json ./tsconfig.json
COPY --chown=node:node --from=development /app/tsconfig.build.json ./tsconfig.build.json
COPY --chown=node:node --from=development /app/nest-cli.json ./nest-cli.json

RUN pnpm build

# Removes unnecessary packages adn re-install only production dependencies
ENV NODE_ENV production
RUN pnpm prune --prod
RUN pnpm install --prod

USER node

######################
# BUILD FOR PRODUCTION
######################

FROM node:20-alpine AS production
WORKDIR /app

# Install pnpm globally again for production
RUN npm install -g pnpm

RUN mkdir -p src/generated && chown -R node:node src

# Copy the bundled code from the build stage to the production image
COPY --chown=node:node --from=builder /app/src/generated/i18n.generated.ts ./src/generated/i18n.generated.ts
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/package.json ./

USER node

# Run migrations and start the server
CMD pnpm migration:up && node dist/main.js


