# Production Dockerfile for AvancePharma API
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/

# Install all dependencies (including devDependencies for build)
RUN npm ci && npm cache clean --force

# Build the app
FROM base AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build shared package first
RUN npm run build --workspace=packages/shared

# Build API
RUN npm run build --workspace=apps/api

# Generate JWT keys if not present
RUN mkdir -p /app/apps/api/keys && \
    if [ ! -f /app/apps/api/keys/private.pem ]; then \
      openssl genrsa -out /app/apps/api/keys/private.pem 2048; \
    fi && \
    if [ ! -f /app/apps/api/keys/public.pem ]; then \
      openssl rsa -in /app/apps/api/keys/private.pem -pubout -out /app/apps/api/keys/public.pem; \
    fi

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy built application
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared/dist ./node_modules/@avancepharma/shared

# Copy JWT keys
COPY --from=builder /app/apps/api/keys ./keys

USER nestjs

EXPOSE 8080

ENV PORT 8080

CMD ["node", "dist/main.js"]