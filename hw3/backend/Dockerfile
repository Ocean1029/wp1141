# Use Node.js LTS version
FROM node:18-alpine

# Install pnpm globally
RUN npm install -g pnpm@latest && npm cache clean --force

# Set working directory
WORKDIR /app

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

# Expose backend port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["pnpm", "run", "dev"]

