# syntax=docker/dockerfile:1

# Base image with Node.js 24 and pnpm
FROM node:24-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@12.15.0 --activate

# 1. Install workspace dependencies and build the web application
FROM base AS builder
WORKDIR /repo

COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @latentsignals/web build

# 2. Isolate the web app with production dependencies only
RUN pnpm --filter @latentsignals/web deploy --prod --legacy /prod/web

# 3. Production runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV POETRIES_DIR=/app/poetries

COPY --from=builder /prod/web ./
COPY --from=builder /repo/apps/web/build ./build
COPY --from=builder /repo/poetries ./poetries

EXPOSE 3000

CMD ["pnpm", "run", "start"]
