# ==============================================================================
# Innovista Aluminium & Glass POS - Multi-Stage Production Dockerfile
# ==============================================================================

# Step 1: Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package dependencies
COPY package.json ./
RUN npm install

# Copy complete project codebase
COPY . .

# Compile Vite frontend assets and bundle Express backend to dist/server.cjs
RUN npm run build

# Step 2: Production Execution Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package specifications and install production dependencies
COPY package.json ./
RUN npm install --only=production

# Copy compiled distribution bundle from builder stage
COPY --from=builder /app/dist ./dist

# Ensure persistence directory exists for JSON DB
RUN mkdir -p /app/data

# Expose internal application port
EXPOSE 3000

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Launch application
CMD ["node", "dist/server.cjs"]
