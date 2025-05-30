# 🚀 Deployment Guide

This guide provides comprehensive instructions for deploying the Dynamic Procurement Dashboard in various environments, from local development to production-scale deployments.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [Docker Deployment](#docker-deployment)
- [Cloud Deployments](#cloud-deployments)
- [Database Setup](#database-setup)
- [Environment Configuration](#environment-configuration)
- [Monitoring & Logging](#monitoring--logging)
- [Scaling Considerations](#scaling-considerations)
- [Troubleshooting](#troubleshooting)

## ✅ Prerequisites

### System Requirements
- **Node.js**: >= 16.0.0
- **npm**: >= 8.0.0
- **Database**: SQLite (dev) / PostgreSQL 13+ (prod) / MySQL 8+ (prod)
- **Memory**: 512MB+ (dev) / 2GB+ (prod)
- **Storage**: 1GB+ for application and database

### Development Tools
- Git
- Code editor (VS Code recommended)
- Database client (DBeaver, pgAdmin, etc.)
- Docker (optional)

## 🛠️ Local Development

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/myownipgit/dynamic-procurement-dashboard.git
cd dynamic-procurement-dashboard
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env`:
```env
# Application
NODE_ENV=development
PORT=3000
API_PORT=3001

# Database
DATABASE_URL=sqlite://./procurement.db
DATABASE_TYPE=sqlite

# API Configuration
API_KEY_SECRET=your-secret-key-here
JWT_SECRET=your-jwt-secret-here

# Logging
LOG_LEVEL=debug
LOG_FILE=./logs/app.log

# Cache
REDIS_URL=redis://localhost:6379
CACHE_TTL=300

# Security
CORS_ORIGIN=http://localhost:3000
API_RATE_LIMIT=1000
```

4. **Set up the database**
```bash
npm run db:setup
```

5. **Start development servers**
```bash
# Start both frontend and backend
npm run dev

# Or start separately
npm run dev:frontend  # Port 3000
npm run dev:backend   # Port 3001
```

6. **Verify installation**
```bash
curl http://localhost:3001/api/v1/charts
```

### Development Workflow

```bash
# Run linting
npm run lint

# Format code
npm run format

# Type checking (if using TypeScript)
npm run type-check

# Reset database
npm run db:reset
```

## 🏭 Production Deployment

### Build Process

1. **Build the application**
```bash
# Install production dependencies only
npm ci --only=production

# Build frontend assets
npm run build

# The built files will be in ./dist
```

2. **Optimize assets**
```bash
# The build process automatically:
# - Minifies JavaScript and CSS
# - Optimizes images
# - Generates source maps
# - Creates compressed assets (gzip/brotli)
```

### Server Configuration

#### Nginx Configuration
```nginx
# /etc/nginx/sites-available/dynamic-procurement-dashboard
server {
    listen 80;
    listen 443 ssl http2;
    server_name dashboard.yourdomain.com;

    # SSL Configuration
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self'" always;

    # Frontend Assets
    location / {
        root /var/www/dynamic-procurement-dashboard/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API Proxy
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Health Check
    location /health {
        proxy_pass http://localhost:3001/health;
        access_log off;
    }
}
```

#### PM2 Process Management
```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'procurement-dashboard-api',
    script: './server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/api-error.log',
    out_file: './logs/api-out.log',
    log_file: './logs/api-combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max_old_space_size=1024'
  }]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Environment Variables (Production)

```env
# Application
NODE_ENV=production
PORT=3001
API_VERSION=v1

# Database (PostgreSQL)
DATABASE_URL=postgresql://username:password@localhost:5432/procurement_dashboard
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=20
DATABASE_SSL=true

# Redis Cache
REDIS_URL=redis://localhost:6379
CACHE_TTL=300
CACHE_PREFIX=procurement:

# Security
API_KEY_SECRET=super-secure-secret-key-min-32-chars
JWT_SECRET=another-super-secure-jwt-secret-key
CORS_ORIGIN=https://dashboard.yourdomain.com
SESSION_SECRET=session-secret-key

# Rate Limiting
API_RATE_LIMIT=1000
API_RATE_WINDOW=900

# Monitoring
LOG_LEVEL=info
LOG_FILE=/var/log/procurement-dashboard/app.log
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project

# External APIs
NOTIFICATION_WEBHOOK_URL=https://hooks.slack.com/services/...
```

## 🐳 Docker Deployment

### Dockerfile
```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY . .
RUN npm run build

# Production image
FROM node:18-alpine AS production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/server ./server

# Create logs directory
RUN mkdir -p /app/logs && chown -R nextjs:nodejs /app/logs

USER nextjs

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

CMD ["node", "server/index.js"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  dashboard:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/procurement
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: procurement
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./data/database-schema.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - dashboard
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### Docker Commands
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f dashboard

# Scale the application
docker-compose up -d --scale dashboard=3

# Stop all services
docker-compose down

# Clean rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## ☁️ Cloud Deployments

### AWS Deployment

#### Using AWS ECS with Fargate
```yaml
# task-definition.json
{
  "family": "procurement-dashboard",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::account:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "dashboard",
      "image": "your-account.dkr.ecr.region.amazonaws.com/procurement-dashboard:latest",
      "portMappings": [
        {
          "containerPort": 3001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:procurement/database-url"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/procurement-dashboard",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### CloudFormation Template (excerpt)
```yaml
Resources:
  ECSCluster:
    Type: AWS::ECS::Cluster
    Properties:
      ClusterName: procurement-dashboard

  DatabaseInstance:
    Type: AWS::RDS::DBInstance
    Properties:
      DBInstanceClass: db.t3.micro
      Engine: postgres
      EngineVersion: '15.4'
      AllocatedStorage: 20
      StorageType: gp2
      StorageEncrypted: true

  ApplicationLoadBalancer:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      Type: application
      Scheme: internet-facing
      SecurityGroups:
        - !Ref ALBSecurityGroup
      Subnets:
        - !Ref PublicSubnet1
        - !Ref PublicSubnet2
```

### Google Cloud Platform

#### App Engine Configuration
```yaml
# app.yaml
runtime: nodejs18

env_variables:
  NODE_ENV: production
  DATABASE_URL: postgres://username:password@/dbname?host=/cloudsql/project:region:instance

automatic_scaling:
  min_instances: 1
  max_instances: 10
  target_cpu_utilization: 0.6

resources:
  cpu: 1
  memory_gb: 1
  disk_size_gb: 10

vpc_access_connector:
  name: projects/PROJECT_ID/locations/REGION/connectors/vpc-connector

handlers:
- url: /api/.*
  script: auto
  secure: always

- url: /.*
  static_files: dist/index.html
  upload: dist/index.html
  secure: always
```

### Vercel Deployment

#### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "api/**/*.js": {
      "memory": 1024,
      "maxDuration": 30
    }
  }
}
```

## 🗄️ Database Setup

### PostgreSQL (Recommended for Production)

1. **Install PostgreSQL**
```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS
brew install postgresql
```

2. **Create database and user**
```sql
-- Connect as postgres user
sudo -u postgres psql

-- Create database
CREATE DATABASE procurement_dashboard;

-- Create user
CREATE USER dashboard_user WITH ENCRYPTED PASSWORD 'secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE procurement_dashboard TO dashboard_user;

-- Enable required extensions
\c procurement_dashboard
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

3. **Run schema migration**
```bash
# Using provided schema
psql -h localhost -U dashboard_user -d procurement_dashboard -f data/postgresql-schema.sql

# Or using migration tool
npm run migrate:up
```

### MySQL Setup

```sql
-- Create database
CREATE DATABASE procurement_dashboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER 'dashboard_user'@'%' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON procurement_dashboard.* TO 'dashboard_user'@'%';
FLUSH PRIVILEGES;
```

### Database Performance Tuning

#### PostgreSQL Configuration
```ini
# postgresql.conf adjustments for production
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
min_wal_size = 1GB
max_wal_size = 4GB
```

#### Indexes for Performance
```sql
-- Essential indexes for chart queries
CREATE INDEX CONCURRENTLY idx_spend_transactions_date_amount 
ON spend_transactions(transaction_date, total_amount);

CREATE INDEX CONCURRENTLY idx_spend_transactions_vendor_date 
ON spend_transactions(vendor_id, transaction_date);

CREATE INDEX CONCURRENTLY idx_vendors_state_active 
ON vendors(state) WHERE state IS NOT NULL;

-- Partial indexes for common filters
CREATE INDEX CONCURRENTLY idx_transactions_large_amounts 
ON spend_transactions(total_amount) WHERE total_amount > 100000;
```

## 📊 Monitoring & Logging

### Application Monitoring

#### Health Check Endpoint
```javascript
// server/routes/health.js
app.get('/health', (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    checks: {
      database: 'checking...',
      redis: 'checking...',
      memory: process.memoryUsage()
    }
  };

  // Check database connection
  db.query('SELECT 1')
    .then(() => {
      healthcheck.checks.database = 'connected';
    })
    .catch(() => {
      healthcheck.checks.database = 'error';
      res.status(503);
    });

  res.json(healthcheck);
});
```

#### Metrics Collection
```javascript
// server/middleware/metrics.js
const prometheus = require('prom-client');

const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
});

const chartDataRequests = new prometheus.Counter({
  name: 'chart_data_requests_total',
  help: 'Total number of chart data requests',
  labelNames: ['chart_id', 'status']
});

module.exports = { httpRequestDuration, chartDataRequests };
```

### Logging Configuration

#### Winston Logger Setup
```javascript
// server/utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'procurement-dashboard' },
  transports: [
    new winston.transports.File({ 
      filename: './logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: './logs/combined.log' 
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

### Monitoring Setup

#### Grafana Dashboard Configuration
```json
{
  "dashboard": {
    "title": "Procurement Dashboard Metrics",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{route}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph", 
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      }
    ]
  }
}
```

## 📈 Scaling Considerations

### Horizontal Scaling

1. **Load Balancer Configuration**
```nginx
upstream dashboard_backend {
    least_conn;
    server dashboard-1:3001 max_fails=3 fail_timeout=30s;
    server dashboard-2:3001 max_fails=3 fail_timeout=30s;
    server dashboard-3:3001 max_fails=3 fail_timeout=30s;
}

server {
    location /api/ {
        proxy_pass http://dashboard_backend;
        # ... other proxy settings
    }
}
```

2. **Session Management**
```javascript
// Use Redis for session storage
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true, maxAge: 86400000 }
}));
```

### Database Scaling

1. **Read Replicas**
```javascript
// Database connection pool with read/write separation
const writePool = new Pool({ connectionString: process.env.DATABASE_WRITE_URL });
const readPool = new Pool({ connectionString: process.env.DATABASE_READ_URL });

function getConnection(operation = 'read') {
  return operation === 'write' ? writePool : readPool;
}
```

2. **Connection Pooling**
```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  min: 2,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### Caching Strategy

1. **Redis Caching**
```javascript
// Cache chart data for 5 minutes
const cacheKey = `chart:${chartId}:${JSON.stringify(parameters)}`;
const cachedData = await redis.get(cacheKey);

if (cachedData) {
  return JSON.parse(cachedData);
}

const data = await executeChartQuery(chartId, parameters);
await redis.setex(cacheKey, 300, JSON.stringify(data));
return data;
```

2. **CDN for Static Assets**
```nginx
# Cache static assets at CDN edge
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header X-Cache-Status "HIT";
}
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Errors
```bash
# Check database connectivity
pg_isready -h localhost -p 5432 -U dashboard_user

# Check connection pool status
SELECT count(*) FROM pg_stat_activity WHERE datname = 'procurement_dashboard';
```

#### 2. Memory Issues
```bash
# Monitor memory usage
pm2 monit

# Restart if memory usage is high
pm2 restart all

# Check for memory leaks
node --inspect server/index.js
```

#### 3. Slow Query Performance
```sql
-- Enable query logging
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000;

-- Analyze slow queries
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;
```

#### 4. Chart Rendering Issues
```javascript
// Debug chart configuration
console.log('Chart config:', JSON.stringify(config, null, 2));
console.log('Generated SQL:', buildQuery(config, parameters));
console.log('Chart data:', data);

// Validate data format
if (!Array.isArray(data) || data.some(item => !item.label || !item.value)) {
  throw new Error('Invalid chart data format');
}
```

### Debugging Tools

1. **Application Logs**
```bash
# View real-time logs
tail -f logs/combined.log

# Search for specific errors
grep "ERROR" logs/combined.log | tail -20

# View PM2 logs
pm2 logs --lines 100
```

2. **Database Debugging**
```sql
-- Check current connections
SELECT pid, usename, datname, client_addr, state 
FROM pg_stat_activity 
WHERE datname = 'procurement_dashboard';

-- Monitor query performance
SELECT query, state, query_start, backend_start 
FROM pg_stat_activity 
WHERE state != 'idle';
```

3. **Performance Profiling**
```bash
# Node.js profiling
node --prof server/index.js
node --prof-process isolate-*.log > profile.txt

# Memory usage analysis
node --inspect server/index.js
# Open chrome://inspect in Chrome
```

### Emergency Procedures

#### 1. Database Recovery
```bash
# Create backup
pg_dump procurement_dashboard > backup.sql

# Restore from backup
psql procurement_dashboard < backup.sql

# Point-in-time recovery
pg_basebackup -D /var/lib/postgresql/backup -U postgres
```

#### 2. Application Recovery
```bash
# Restart all services
pm2 restart all

# Deploy previous version
git checkout previous-stable-tag
npm run build
pm2 restart all

# Scale down if overloaded
pm2 scale dashboard 1
```

---

**Need help with deployment? Check our [Support Documentation](SUPPORT.md) or open an issue on GitHub.**