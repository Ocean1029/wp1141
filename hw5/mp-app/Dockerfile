# ---------------------------------------------------------------------------
# Stage 1: Base Image
# ---------------------------------------------------------------------------
FROM node:20-alpine AS base

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED 1

# ---------------------------------------------------------------------------
# Stage 2: Install Dependencies
# Only reinstall when package.json changes
# ---------------------------------------------------------------------------
FROM base AS deps
RUN apk add --no-cache libc6-compat

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# ---------------------------------------------------------------------------
# Stage 3: Build
# Includes Prisma Generate + Next.js Build
# ---------------------------------------------------------------------------
FROM base AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client (Prod version)
RUN npx prisma generate

# Build Next.js
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 4: Production Runner
# Only the minimal output needed to run the app
# ---------------------------------------------------------------------------
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Copy Production Artifacts
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Fix ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
