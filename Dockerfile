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

FROM base AS development
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

# Install production dependencies and add ts-node, typescript, tsconfig-paths
ENV NODE_ENV production
RUN pnpm install --prod
RUN pnpm add ts-node typescript tsconfig-paths

USER node

######################
# BUILD FOR PRODUCTION
######################

FROM base AS production
WORKDIR /app

RUN mkdir -p src/database src/generated && chown -R node:node src

# Copy the bundled code, data-source, and tsconfig from the build stage
COPY --chown=node:node --from=builder /app/src/generated/i18n.generated.ts ./src/generated/i18n.generated.ts
COPY --chown=node:node --from=builder /app/src/database/data-source.ts ./src/database/data-source.ts
COPY --chown=node:node --from=builder /app/tsconfig.json ./tsconfig.json
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/package.json ./

USER node

# Start the server using the production build
CMD ["/bin/sh", "-c", "pnpm migration:up && node dist/main.js"]