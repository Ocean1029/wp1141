# Use Node.js LTS version
FROM node:20-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Set working directory
WORKDIR /app

# Copy package files first (for better layer caching)
COPY package.json package-lock.json* ./

# Install dependencies using npm
RUN npm ci || npm install

# Copy Prisma schema
COPY prisma ./prisma

# Generate Prisma Client  
RUN npm run prisma:generate

# Copy application files
COPY . .

# Create a non-root user and switch to it
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose backend port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Generate Prisma Client on start (for volume-mounted scenarios)
CMD sh -c "npm run prisma:generate && npm run dev"

