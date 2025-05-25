# Redundancy and Fault-Resilience Implementation

This document outlines the implementation of redundancy and fault-resilience for the Renfo Pas à Pas application.

## Overview

The current architecture has several single points of failure:
1. The application runs as a single instance
2. The database is a single instance
3. Videos are stored in the local filesystem within the application container

To address these issues, we'll implement a redundant architecture with the following components:
1. Multiple application instances behind a load balancer
2. A replicated database setup
3. Shared storage for videos

## Implementation Details

### Application Redundancy

We'll use Docker Swarm or Kubernetes to deploy multiple instances of the application. This will provide:
- High availability through multiple instances
- Automatic failover if an instance goes down
- Load balancing across instances

### Database Redundancy

We'll implement PostgreSQL replication with:
- A primary database for write operations
- One or more replica databases for read operations
- Automatic failover if the primary database goes down

### Storage Redundancy

For video storage, we'll implement one of the following solutions:
1. **Network File System (NFS)**: A shared filesystem accessible by all application instances
2. **Object Storage**: A distributed object storage system like MinIO
3. **Cloud Storage**: A managed service like AWS S3 or Azure Blob Storage

## Docker Compose Implementation

Below is an updated Docker Compose configuration that implements redundancy:

```yaml
version: '3.8'

services:
  # Load Balancer
  nginx:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - app
    networks:
      - app-network
    restart: unless-stopped

  # Application (scaled to multiple instances)
  app:
    build:
      context: .
      dockerfile: Dockerfile
    deploy:
      replicas: 3
      restart_policy:
        condition: on-failure
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://user:password@db-primary:5432/renfo-pas-a-pas
      - VIDEO_STORAGE_PATH=/app/shared/videos
    volumes:
      - video_storage:/app/public/videos
    depends_on:
      - db-primary
    networks:
      - app-network

  # Primary Database
  db-primary:
    build:
      context: ./db
      dockerfile: Dockerfile
    volumes:
      - postgres_primary_data:/var/lib/postgresql/data
      - ./db/postgresql.conf:/etc/postgresql/postgresql.conf
    command: postgres -c config_file=/etc/postgresql/postgresql.conf
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=renfo-pas-a-pas
    networks:
      - app-network
    restart: unless-stopped

  # Replica Database
  db-replica:
    build:
      context: ./db
      dockerfile: Dockerfile
    volumes:
      - postgres_replica_data:/var/lib/postgresql/data
      - ./db/postgresql.replica.conf:/etc/postgresql/postgresql.conf
    command: postgres -c config_file=/etc/postgresql/postgresql.conf
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=renfo-pas-a-pas
    depends_on:
      - db-primary
    networks:
      - app-network
    restart: unless-stopped

networks:
  app-network:
    driver: bridge

volumes:
  postgres_primary_data:
  postgres_replica_data:
  video_storage:
    driver: local
```

## NGINX Configuration

Here's a sample NGINX configuration for load balancing:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream app_servers {
        server app:3000;
        # Docker Swarm or Kubernetes will automatically add more instances
    }

    server {
        listen 80;

        location / {
            proxy_pass http://app_servers;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

## PostgreSQL Replication Configuration

### Primary Server Configuration

```
# postgresql.conf for primary
listen_addresses = '*'
wal_level = replica
max_wal_senders = 10
wal_keep_segments = 64
```

### Replica Server Configuration

```
# postgresql.conf for replica
listen_addresses = '*'
hot_standby = on
```

## Implementation Steps

1. **Set up PostgreSQL Replication**:
   - Configure the primary server
   - Create a replica from the primary
   - Set up automatic failover

2. **Configure Shared Storage**:
   - Set up a volume for video storage
   - Update the application to use the shared storage

3. **Deploy Multiple Application Instances**:
   - Update the Docker Compose file
   - Deploy with Docker Swarm or Kubernetes

4. **Set up Load Balancing**:
   - Configure NGINX as a load balancer
   - Test failover scenarios

## Deployment Instructions

To deploy the redundant system:

1. **Prepare the Configuration Files**:
   - Ensure all configuration files are in place:
     - `nginx/nginx.conf`: NGINX load balancer configuration
     - `db/postgresql.conf`: PostgreSQL primary server configuration
     - `db/postgresql.replica.conf`: PostgreSQL replica server configuration
     - `docker-compose.redundant.yml`: Docker Compose configuration for the redundant system

2. **Start the Redundant System**:
   ```bash
   docker-compose -f docker-compose.redundant.yml up -d
   ```

   Or on Windows:
   ```powershell
   docker-compose -f docker-compose.redundant.yml up -d
   ```

3. **Verify the Deployment**:
   ```bash
   docker-compose -f docker-compose.redundant.yml ps
   ```

   Or on Windows:
   ```powershell
   docker-compose -f docker-compose.redundant.yml ps
   ```

## Testing the Redundancy Implementation

To test the redundancy implementation, you can use the provided test scripts:

- On Linux/macOS:
  ```bash
  chmod +x scripts/test-redundancy.sh
  ./scripts/test-redundancy.sh
  ```

- On Windows:
  ```powershell
  scripts\test-redundancy.ps1
  ```

These scripts will:
1. Start the redundant system
2. Verify that all services are running
3. Test that the application is accessible
4. Simulate failure of one application instance and verify that the application is still accessible
5. Simulate failure of the primary database and verify that the application is still accessible
6. Clean up by stopping all services

## Monitoring and Maintenance

To ensure the redundant system is working properly:

1. **Implement Monitoring**:
   - Set up health checks for all services
   - Configure alerts for service failures

2. **Regular Backups**:
   - Back up the database regularly
   - Back up the video files

3. **Failover Testing**:
   - Regularly test failover scenarios
   - Document recovery procedures

## Conclusion

This redundancy implementation addresses the single points of failure in the current architecture and provides a more robust and fault-tolerant system. By implementing multiple application instances, database replication, and shared storage, we can ensure high availability and data durability.
