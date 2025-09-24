# Deployment Guide

## Overview

This guide covers deploying the TaskManagement application to various environments including development, staging, and production.

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- MongoDB 7.0+
- Redis 7.2+
- Domain name and SSL certificate (for production)

## Environment Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd TaskManagement
```

### 2. Environment Configuration

Copy the environment template and configure:

```bash
cp env.example .env
# Edit .env with your configuration
```

### 3. Install Dependencies

```bash
make install
```

## Local Development

### Using Docker Compose (Recommended)

```bash
# Start all services
make dev

# View logs
make logs

# Stop services
make dev-stop
```

### Manual Setup

```bash
# Start MongoDB and Redis
docker-compose up mongodb redis -d

# Start server
cd server && npm run dev

# Start web app (in another terminal)
cd web && npm run dev
```

## Staging Deployment

### 1. Prepare Environment

```bash
# Copy staging environment
cp env.example .env.staging

# Update configuration for staging
# - Set NODE_ENV=staging
# - Update database URLs
# - Set appropriate CORS origins
```

### 2. Build and Deploy

```bash
# Build Docker images
make build-docker

# Deploy to staging
make deploy-staging
```

### 3. Verify Deployment

```bash
# Check service status
make status

# View logs
make logs
```

## Production Deployment

### 1. Server Requirements

- **CPU**: 2+ cores
- **RAM**: 4GB+ (8GB recommended)
- **Storage**: 50GB+ SSD
- **OS**: Ubuntu 20.04+ or CentOS 8+

### 2. Environment Setup

```bash
# Create production environment
cp env.example .env.production

# Configure production settings
# - Set NODE_ENV=production
# - Use production database URLs
# - Configure SSL certificates
# - Set secure JWT secrets
```

### 3. SSL Configuration

```bash
# Generate SSL certificates (Let's Encrypt)
sudo certbot certonly --standalone -d yourdomain.com

# Update nginx configuration
# - Add SSL configuration
# - Redirect HTTP to HTTPS
```

### 4. Database Setup

```bash
# Create production database
# - Set up MongoDB replica set
# - Configure Redis persistence
# - Set up database backups
```

### 5. Deploy Application

```bash
# Build production images
make build-docker

# Deploy to production
make deploy
```

### 6. Post-Deployment

```bash
# Run database migrations
make migrate

# Seed initial data
make seed

# Verify deployment
curl -f https://yourdomain.com/health
```

## Docker Configuration

### Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_ROOT_USERNAME}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
    volumes:
      - mongodb_data:/data/db
    networks:
      - app-network

  redis:
    image: redis:7.2-alpine
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - app-network

  server:
    image: your-registry/taskmanagement-server:latest
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - MONGO_URI=${MONGO_URI}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongodb
      - redis
    networks:
      - app-network

  web:
    image: your-registry/taskmanagement-web:latest
    restart: unless-stopped
    depends_on:
      - server
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.prod.conf:/etc/nginx/nginx.conf
      - /etc/letsencrypt:/etc/letsencrypt
    depends_on:
      - server
      - web
    networks:
      - app-network

volumes:
  mongodb_data:
  redis_data:

networks:
  app-network:
    driver: bridge
```

## Monitoring and Logging

### 1. Application Monitoring

```bash
# View application logs
make logs

# Monitor resource usage
docker stats

# Check service health
make status
```

### 2. Database Monitoring

```bash
# MongoDB logs
docker-compose logs mongodb

# Redis logs
docker-compose logs redis

# Database backup
make db-backup
```

### 3. Performance Monitoring

- Set up monitoring tools (Prometheus, Grafana)
- Configure alerting for critical metrics
- Monitor database performance
- Track API response times

## Backup and Recovery

### 1. Database Backup

```bash
# Create backup
make db-backup

# Restore from backup
make db-restore BACKUP_DIR=backups/20240101_120000
```

### 2. Application Backup

```bash
# Backup application data
tar -czf taskmanagement-backup-$(date +%Y%m%d).tar.gz \
  uploads/ \
  logs/ \
  .env.production
```

## Security Considerations

### 1. Environment Variables

- Use strong, unique secrets
- Rotate secrets regularly
- Never commit secrets to version control

### 2. Network Security

- Use HTTPS in production
- Configure firewall rules
- Limit database access
- Use VPN for admin access

### 3. Application Security

- Enable security headers
- Use rate limiting
- Validate all inputs
- Keep dependencies updated

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check MongoDB status
   docker-compose logs mongodb
   
   # Verify connection string
   echo $MONGO_URI
   ```

2. **Redis Connection Failed**
   ```bash
   # Check Redis status
   docker-compose logs redis
   
   # Test Redis connection
   redis-cli ping
   ```

3. **Application Won't Start**
   ```bash
   # Check logs
   make logs
   
   # Verify environment variables
   docker-compose config
   ```

4. **SSL Certificate Issues**
   ```bash
   # Check certificate validity
   openssl x509 -in /etc/letsencrypt/live/yourdomain.com/cert.pem -text -noout
   
   # Renew certificate
   sudo certbot renew
   ```

### Performance Issues

1. **Slow Database Queries**
   - Check database indexes
   - Monitor query performance
   - Optimize database queries

2. **High Memory Usage**
   - Monitor container memory usage
   - Adjust container limits
   - Optimize application code

3. **Slow API Responses**
   - Check Redis cache hit rate
   - Monitor API response times
   - Optimize database queries

## Maintenance

### Regular Tasks

1. **Daily**
   - Monitor application logs
   - Check service health
   - Verify backups

2. **Weekly**
   - Update dependencies
   - Review security logs
   - Clean up old logs

3. **Monthly**
   - Security updates
   - Performance review
   - Backup verification

### Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild and deploy
make build-docker
make deploy

# Verify deployment
make status
```
