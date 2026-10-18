# syntax=docker/dockerfile:1

# Base image with Node.js 24 and pnpm
FROM node:24-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.33.3 --activate

# 1. Install all dependencies for build
FROM base AS dependencies
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages ./packages
COPY poetries ./poetries

RUN pnpm install --frozen-lockfile

# 2. Build the web application
FROM base AS builder
WORKDIR /app

COPY --from=dependencies /app ./
COPY apps/web ./apps/web
COPY tsconfig.json ./

RUN pnpm --filter @latentsignals/web build

# 3. Production dependencies only
FROM base AS prod-dependencies
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages ./packages
COPY poetries ./poetries

RUN pnpm install --prod --frozen-lockfile

# 4. Production runner
FROM node:24-alpine AS runner
WORKDIR /app/apps/web

ENV NODE_ENV=production
ENV PORT=3000
ENV POETRIES_DIR=/app/poetries

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.33.3 --activate

# Copy production dependencies
COPY --from=prod-dependencies /app/node_modules /app/node_modules
COPY --from=prod-dependencies /app/apps/web/node_modules /app/apps/web/node_modules

# Copy workspace configs and web build
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/pnpm-workspace.yaml /app/pnpm-workspace.yaml
COPY --from=builder /app/apps/web/package.json /app/apps/web/package.json
COPY --from=builder /app/apps/web/build /app/apps/web/build

# Copy poetries directory into production image
COPY --from=builder /app/poetries /app/poetries

EXPOSE 3000

CMD ["pnpm", "run", "start"]
