# Use Node.js LTS version
FROM node:18-alpine

# Install pnpm globally and wget for healthcheck
RUN npm install -g pnpm@latest && npm cache clean --force && \
    apk add --no-cache wget

# Set working directory
WORKDIR /app

# Set environment variable to avoid warnings
ENV NODE_ENV=development

# Copy package files first (for better layer caching)
COPY package.json pnpm-lock.yaml* ./

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile || pnpm install

# Copy application files
COPY . .

# Create a non-root user and switch to it
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose frontend port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Start the application
CMD ["pnpm", "start"]

