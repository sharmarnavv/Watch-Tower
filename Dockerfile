FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /apps

# Install Bun
RUN apk add --no-cache curl unzip
RUN curl -fsSL https://bun.sh/install | bash

# Copy package files
COPY package.json bun.lock ./
COPY packages/db/package.json ./packages/db/package.json
COPY apps/api/package.json ./apps/api/package.json
COPY apps/frontend/package.json ./apps/frontend/package.json

# Install dependencies
RUN /root/.bun/bin/bun install

# Setup development environment
FROM base AS development
WORKDIR /apps
COPY --from=deps /apps/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN cd packages/db && npx prisma generate

# Build the application
FROM base AS builder
WORKDIR /apps
COPY --from=development /apps .

# Build the application
RUN npm run build

# Production image
FROM base AS production
WORKDIR /apps

ENV NODE_ENV production

# Copy necessary files
COPY --from=builder /apps/node_modules ./node_modules
COPY --from=builder /apps/packages/db/node_modules ./packages/db/node_modules
COPY --from=builder /apps/packages/db/prisma ./packages/db/prisma
COPY --from=builder /apps/packages/db/src ./packages/db/src
COPY --from=builder /apps/apps/api/dist ./apps/api/dist
COPY --from=builder /apps/apps/frontend/dist ./apps/frontend/dist

# Expose ports
EXPOSE 8080
EXPOSE 3000

# Create a script to run migrations and start the application
RUN echo '#!/bin/sh\ncd packages/db && npx prisma migrate deploy && cd ../../apps/api && node dist/index.js' > /apps/start.sh
RUN chmod +x /apps/start.sh

CMD ["/apps/start.sh"]