#!/bin/bash

# MyMoney Azure Deployment Script with ACR
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 MyMoney Azure Deployment Script (ACR)${NC}"
echo "=========================================="

# Check if required tools are installed
command -v az >/dev/null 2>&1 || { echo -e "${RED}❌ Azure CLI is required but not installed. Aborting.${NC}" >&2; exit 1; }
command -v docker >/dev/null 2>&1 || { echo -e "${RED}❌ Docker is required but not installed. Aborting.${NC}" >&2; exit 1; }

# Configuration
RESOURCE_GROUP="mymoney-rg"
LOCATION="northeurope"
APP_NAME="mymoney-app-$(date +%s)"
ACR_NAME="mymoney$(date +%s)"
DOCKER_IMAGE_NAME="mymoney"
DOCKER_TAG="latest"

echo -e "${YELLOW}📋 Configuration:${NC}"
echo "Resource Group: $RESOURCE_GROUP"
echo "Location: $LOCATION"
echo "App Name: $APP_NAME"
echo "ACR Name: $ACR_NAME"
echo "Docker Image: $DOCKER_IMAGE_NAME:$DOCKER_TAG"
echo ""

# Login to Azure (if not already logged in)
echo -e "${YELLOW}🔐 Checking Azure login...${NC}"
az account show >/dev/null 2>&1 || {
    echo -e "${YELLOW}Please login to Azure:${NC}"
    az login
}

# Get subscription ID
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
echo -e "${GREEN}✅ Using subscription: $SUBSCRIPTION_ID${NC}"

# Create resource group if it doesn't exist
echo -e "${YELLOW}📦 Creating resource group...${NC}"
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create Azure Container Registry
echo -e "${YELLOW}🏗️ Creating Azure Container Registry...${NC}"
az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic --admin-enabled true

# Get ACR login server
ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --resource-group $RESOURCE_GROUP --query loginServer --output tsv)
echo -e "${GREEN}✅ ACR Login Server: $ACR_LOGIN_SERVER${NC}"

# Login to ACR
echo -e "${YELLOW}🔐 Logging into ACR...${NC}"
az acr login --name $ACR_NAME

# Build Docker image (reuse if already built)
if ! docker images | grep -q "mymoney.*latest"; then
    echo -e "${YELLOW}🐳 Building Docker image...${NC}"
    docker build -t $DOCKER_IMAGE_NAME:$DOCKER_TAG .
else
    echo -e "${GREEN}✅ Docker image already exists, reusing...${NC}"
fi

# Tag and push to ACR
echo -e "${YELLOW}📤 Pushing to ACR...${NC}"
docker tag $DOCKER_IMAGE_NAME:$DOCKER_TAG $ACR_LOGIN_SERVER/$DOCKER_IMAGE_NAME:$DOCKER_TAG
docker push $ACR_LOGIN_SERVER/$DOCKER_IMAGE_NAME:$DOCKER_TAG

# Generate secure passwords
SQL_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)

echo -e "${YELLOW}🔐 Generated secure credentials${NC}"

# Create parameters file with actual values
cat > azure-deployment-parameters-acr.json << EOF
{
    "\$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentParameters.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {
        "subscriptionId": {
            "value": "$SUBSCRIPTION_ID"
        },
        "resourceGroupName": {
            "value": "$RESOURCE_GROUP"
        },
        "appName": {
            "value": "$APP_NAME"
        },
        "location": {
            "value": "$LOCATION"
        },
        "hostingPlanName": {
            "value": "${APP_NAME}-plan"
        },
        "serverFarmResourceGroup": {
            "value": "$RESOURCE_GROUP"
        },
        "linuxFxVersion": {
            "value": "DOCKER|$ACR_LOGIN_SERVER/$DOCKER_IMAGE_NAME:$DOCKER_TAG"
        },
        "dockerRegistryUrl": {
            "value": "https://$ACR_LOGIN_SERVER"
        },
        "dockerRegistryUsername": {
            "value": "$ACR_NAME"
        },
        "dockerRegistryPassword": {
            "value": "$(az acr credential show --name $ACR_NAME --query passwords[0].value --output tsv)"
        },
        "sqlServerName": {
            "value": "${APP_NAME}-sql"
        },
        "sqlAdministratorLogin": {
            "value": "mymoneyadmin"
        },
        "sqlAdministratorPassword": {
            "value": "$SQL_PASSWORD"
        },
        "jwtSecretKey": {
            "value": "$JWT_SECRET"
        }
    }
}
EOF

# Deploy ARM template
echo -e "${YELLOW}🚀 Deploying to Azure...${NC}"
az deployment group create \
    --resource-group $RESOURCE_GROUP \
    --template-file azure-deployment-template.json \
    --parameters @azure-deployment-parameters-acr.json

# Get the web app URL
WEB_APP_URL=$(az webapp show --resource-group $RESOURCE_GROUP --name $APP_NAME --query defaultHostName -o tsv)

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo -e "${GREEN}🌐 Your application is available at: https://$WEB_APP_URL${NC}"
echo -e "${YELLOW}📊 SQL Server: ${APP_NAME}-sql.database.windows.net${NC}"
echo -e "${YELLOW}🔑 SQL Admin: mymoneyadmin${NC}"
echo -e "${YELLOW}🔐 SQL Password: $SQL_PASSWORD${NC}"
echo -e "${YELLOW}🏗️ ACR: $ACR_LOGIN_SERVER${NC}"
echo ""
echo -e "${YELLOW}⚠️  Please save these credentials securely!${NC}"

# Clean up temporary files
rm -f azure-deployment-parameters-acr.json

echo -e "${GREEN}🎉 Deployment script completed!${NC}" 