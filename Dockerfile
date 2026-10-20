# syntax=docker/dockerfile:1

# Base image with Node.js 24 and pnpm
FROM node:24-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.33.3 --activate

# 1. Install all dependencies for build
FROM base AS dependencies
WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

# 2. Build the web application
FROM base AS builder
WORKDIR /app

COPY --from=dependencies /app ./
COPY . .

RUN pnpm run build

# 3. Production dependencies only
FROM base AS prod-dependencies
WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --prod --frozen-lockfile

# 4. Production runner
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV POETRIES_DIR=/app/poetries

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.33.3 --activate

# Copy production dependencies
COPY --from=prod-dependencies /app/node_modules ./node_modules

# Copy application files and built assets
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/build ./build
COPY --from=builder /app/public ./public
COPY --from=builder /app/poetries ./poetries

EXPOSE 3000

CMD ["pnpm", "run", "start"]
