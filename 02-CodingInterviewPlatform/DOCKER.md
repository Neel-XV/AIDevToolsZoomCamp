# Docker Deployment Guide

This guide explains how to containerize and run the Coding Interview Platform using Docker.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

## Quick Start

### Build the Docker Image

```bash
docker build -t coding-interview-platform .
```

This creates a production-ready Docker image using a multi-stage build:
1. **Stage 1**: Builds the React frontend with Vite
2. **Stage 2**: Sets up the Node.js server and copies the built frontend

### Run the Container

```bash
docker run -d -p 3000:3000 --name coding-interview coding-interview-platform
```

The application will be available at: **http://localhost:3000**

## Container Management

### View Running Containers

```bash
docker ps
```

### View Container Logs

```bash
docker logs coding-interview
```

Follow logs in real-time:
```bash
docker logs -f coding-interview
```

### Stop the Container

```bash
docker stop coding-interview
```

### Start a Stopped Container

```bash
docker start coding-interview
```

### Remove the Container

```bash
docker rm -f coding-interview
```

### Rebuild After Code Changes

```bash
docker rm -f coding-interview
docker build -t coding-interview-platform .
docker run -d -p 3000:3000 --name coding-interview coding-interview-platform
```

## Configuration

### Using a Different Port

To run on a different port (e.g., 8080):

```bash
docker run -d -p 8080:3000 --name coding-interview coding-interview-platform
```

Then access the application at: http://localhost:8080

### Environment Variables

Set custom port inside the container:

```bash
docker run -d -p 3000:4000 -e PORT=4000 --name coding-interview coding-interview-platform
```

## Health Checks

The container includes built-in health checks that verify the server is responding. Check the container health status:

```bash
docker inspect --format='{{.State.Health.Status}}' coding-interview
```

Expected output: `healthy`

## Dockerfile Overview

```dockerfile
# Multi-stage build for production

# Stage 1: Build frontend
FROM node:18-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Setup backend and serve
FROM node:18-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm install --omit=dev
COPY server/ ./
COPY --from=client-builder /app/client/dist ./client/dist
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
CMD ["node", "src/server.js"]
```

## Troubleshooting

### Port Already in Use

If you see an error about port 3000 being in use:

1. Stop any running development server (`npm run dev`)
2. Or use a different port: `docker run -d -p 8080:3000 ...`

### Container Exits Immediately

Check the logs for errors:

```bash
docker logs coding-interview
```

### Rebuilding with No Cache

If you need a fresh build:

```bash
docker build --no-cache -t coding-interview-platform .
```
