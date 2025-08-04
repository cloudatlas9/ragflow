# RAGFlow Customer Deployment (S-Communication)

This folder contains deployment configurations for RAGFlow adapted to S-Communication's Kubernetes infrastructure.

## Overview

This deployment adapts RAGFlow to work with external services in a Kubernetes environment, following the customer's 1:1 repository-to-service pattern.

## Architecture

### Core Service
- **ragflow-core**: Main RAGFlow application with web UI and API

### External Services (provided separately)
- **mariadb-service**: Database (provided by customer's infrastructure)
- **redis-service**: Cache/queue storage (provided by customer's infrastructure) 
- **minio-service**: Object storage for documents (separate deployment)
- **infinity-service**: Document search engine (separate deployment)

## Files Structure

```
s-com/
├── Dockerfile                      # Build from RAGFlow source
├── service_conf.yaml.template      # Configuration for Kubernetes services
├── helm/values/                    # Kubernetes deployment configs
│   ├── general/values.yaml         # Base configuration
│   ├── development/values.yaml     # Development environment
│   └── production/values.yaml      # Production environment
└── README.md                       # This file
```

## Configuration

### Environment Variables

The application is configured via environment variables:

- `DOC_ENGINE=infinity` - Use Infinity document engine
- `MYSQL_HOST=mariadb-service` - Customer's MariaDB service
- `REDIS_HOST=redis-service` - Customer's Redis service
- `MINIO_HOST=minio-service` - MinIO object storage
- `INFINITY_HOST=infinity-service` - Infinity search engine

### Health Checks

The application provides Kubernetes-compatible health check endpoints:

- `/internal/liveness` - Container health check
- `/internal/readiness` - Service dependency check
- `/internal/metrics` - Prometheus metrics

## Deployment

### Requirements

Before deploying, ensure these services are available in the `lioness` namespace:

1. **mariadb-service** (port 3306) - Provided by customer
2. **redis-service** (port 6379) - Provided by customer
3. **minio-service** (port 9000) - Deploy separately
4. **infinity-service** (port 23817) - Deploy separately

### GitLab CI/CD

The deployment uses the customer's standard CI/CD pipeline:

1. **Build**: Docker image built from source using `s-com/Dockerfile`
2. **Test**: Application tested with `docker-compose.yml`
3. **Deploy**: Kubernetes deployment via Helm charts

### Local Development

For local development:

```bash
# Start with external services
docker-compose up -d

# Access RAGFlow at http://ragflow.local:9380
```

## Service Dependencies

### Critical Dependencies
- **MySQL/MariaDB**: Required for application data
- **Redis**: Required for background processing

### Optional Dependencies  
- **MinIO**: Required for document storage (can be empty initially)
- **Infinity**: Required for document search (can be empty initially)

## Monitoring

- **Health checks**: Available at `/internal/*` endpoints
- **Prometheus metrics**: Available at `/internal/metrics`
- **Logs**: Container logs available via Kubernetes

## Notes

- This deployment follows the customer's 1:1 repository-to-service pattern
- External services are deployed in separate repositories
- Configuration is environment-variable driven for Kubernetes compatibility
- The build process adapts RAGFlow's existing Docker setup for customer requirements 