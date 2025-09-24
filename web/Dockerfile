# =============================================================================
# TASK MANAGEMENT WEB - MULTI-STAGE DOCKERFILE
# =============================================================================

# =============================================================================
# BASE IMAGE
# =============================================================================
FROM node:18-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/*

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# =============================================================================
# DEPENDENCIES STAGE
# =============================================================================
FROM base AS dependencies

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# =============================================================================
# DEVELOPMENT STAGE
# =============================================================================
FROM base AS development

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p dist

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# =============================================================================
# BUILD STAGE
# =============================================================================
FROM base AS build

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# =============================================================================
# NGINX STAGE
# =============================================================================
FROM nginx:alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=build /app/dist /usr/share/nginx/html

# Create nginx user and set permissions
RUN addgroup -g 1001 -S nginx && \
    adduser -S nginx -u 1001 -G nginx

# Create necessary directories
RUN mkdir -p /var/cache/nginx /var/log/nginx /var/run/nginx

# Set permissions
RUN chown -R nginx:nginx /var/cache/nginx /var/log/nginx /var/run/nginx /usr/share/nginx/html

# Switch to non-root user
USER nginx

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:80 || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
