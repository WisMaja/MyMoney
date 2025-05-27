# Multi-stage Dockerfile for MyMoney Application
# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend

# Install Python and build tools for native modules
RUN apk add --no-cache python3 make g++

# Copy frontend package files
COPY frontend/package*.json ./
RUN npm ci --legacy-peer-deps

# Copy frontend source and build
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Backend
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS backend-build
WORKDIR /app/api

# Copy backend project file and restore dependencies
COPY api/*.csproj ./
RUN dotnet restore

# Copy backend source and publish
COPY api/ ./
RUN dotnet publish -c Release -o out

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Install Node.js for serving frontend
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g serve && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy backend build
COPY --from=backend-build /app/api/out ./api

# Copy frontend build
COPY --from=frontend-build /app/frontend/build ./frontend

# Create startup script
RUN echo '#!/bin/bash\n\
serve -s /app/frontend -l 3000 &\n\
cd /app/api && dotnet api.dll --urls="http://0.0.0.0:5032"\n\
' > /app/start.sh && chmod +x /app/start.sh

# Expose ports
EXPOSE 3000 5032

# Set environment variables
ENV ASPNETCORE_ENVIRONMENT=Production
ENV NODE_ENV=production

# Start both services
CMD ["/app/start.sh"] 