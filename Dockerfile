# ##################
# # BUILD BASE IMAGE
# ##################

# # FROM node:20-alpine AS base

# FROM node:20-bookworm-slim AS base

# # Accept optional custom registry (default is empty)
# ARG CUSTOM_REGISTRY=
# ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright


# # Install and use pnpm
# RUN npm install -g pnpm@9.12.3


# # Optionally set custom registry if provided
# RUN if [ -n "$CUSTOM_REGISTRY" ]; then \
#       pnpm config set registry "$CUSTOM_REGISTRY"; \
#     fi

# RUN npx --yes playwright install --with-deps chromium
# RUN chown -R node:node /ms-playwright

# #############################
# # BUILD FOR LOCAL DEVELOPMENT
# #############################

# FROM base AS development
# WORKDIR /app
# RUN chown -R node:node /app

# # Only copy package files first to leverage cache
# COPY --chown=node:node package.json pnpm-lock.yaml ./

# # Install all dependencies (including devDependencies)
# RUN pnpm install

# # Install playwright and its dependencies for Chromium

# # Now copy full source
# COPY --chown=node:node . .

# # Use non-root user
# USER node

# CMD ["pnpm", "start:dev"]
# #####################
# # BUILD BUILDER IMAGE
# #####################

# FROM base AS builder
# WORKDIR /app


# COPY --chown=node:node package.json pnpm-lock.yaml ./
# COPY --chown=node:node --from=development /app/node_modules ./node_modules
# COPY --chown=node:node --from=development /app/src ./src
# COPY --chown=node:node --from=development /app/tsconfig.json ./tsconfig.json
# COPY --chown=node:node --from=development /app/tsconfig.build.json ./tsconfig.build.json
# COPY --chown=node:node --from=development /app/nest-cli.json ./nest-cli.json

# # Build the app
# RUN pnpm build

# # Install only production dependencies and extra tools
# ENV NODE_ENV production
# RUN pnpm install --prod
# RUN pnpm add ts-node typescript tsconfig-paths

# USER node

##################
# BUILD BASE IMAGE
##################

FROM node:20-bookworm-slim AS base

ARG CUSTOM_REGISTRY=

ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Install pnpm
RUN npm install -g pnpm@9.12.3

# Optionally configure custom registry
RUN if [ -n "$CUSTOM_REGISTRY" ]; then \
      pnpm config set registry "$CUSTOM_REGISTRY"; \
    fi

WORKDIR /app


####################
# DEPENDENCIES
####################

FROM base AS dependencies

COPY --chown=node:node package.json pnpm-lock.yaml ./

# Install the project's EXACT dependency versions
RUN pnpm install --frozen-lockfile

# IMPORTANT:
# This now uses the Playwright version installed by package.json/pnpm-lock.yaml
RUN pnpm exec playwright install --with-deps chromium

RUN chown -R node:node /app /ms-playwright


#############################
# BUILD FOR LOCAL DEVELOPMENT
#############################

FROM dependencies AS development

WORKDIR /app

COPY --chown=node:node . .

USER node

CMD ["pnpm", "start:dev"]


#####################
# BUILD BUILDER IMAGE
#####################

FROM dependencies AS builder

WORKDIR /app

COPY --chown=node:node . .

# Build application
RUN pnpm build

ENV NODE_ENV=production

# Keep production dependencies only
RUN pnpm install --prod --frozen-lockfile

RUN pnpm add ts-node typescript tsconfig-paths

USER node