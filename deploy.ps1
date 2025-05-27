# MyMoney Azure Deployment Script (PowerShell)
param(
    [string]$ResourceGroup = "mymoney-rg",
    [string]$Location = "westeurope",
    [string]$AppName = "mymoney-app-$(Get-Date -Format 'yyyyMMddHHmmss')"
)

Write-Host "🚀 MyMoney Azure Deployment Script" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

# Check if required tools are installed
try {
    az --version | Out-Null
} catch {
    Write-Host "❌ Azure CLI is required but not installed. Please install it first." -ForegroundColor Red
    exit 1
}

try {
    docker --version | Out-Null
} catch {
    Write-Host "❌ Docker is required but not installed. Please install it first." -ForegroundColor Red
    exit 1
}

$DockerImageName = "mymoney"
$DockerTag = "latest"

Write-Host "📋 Configuration:" -ForegroundColor Yellow
Write-Host "Resource Group: $ResourceGroup"
Write-Host "Location: $Location"
Write-Host "App Name: $AppName"
Write-Host "Docker Image: $DockerImageName`:$DockerTag"
Write-Host ""

# Login to Azure (if not already logged in)
Write-Host "🔐 Checking Azure login..." -ForegroundColor Yellow
try {
    $account = az account show | ConvertFrom-Json
    Write-Host "✅ Already logged in as: $($account.user.name)" -ForegroundColor Green
} catch {
    Write-Host "Please login to Azure:" -ForegroundColor Yellow
    az login
}

# Get subscription ID
$SubscriptionId = az account show --query id -o tsv
Write-Host "✅ Using subscription: $SubscriptionId" -ForegroundColor Green

# Create resource group if it doesn't exist
Write-Host "📦 Creating resource group..." -ForegroundColor Yellow
az group create --name $ResourceGroup --location $Location

# Build Docker image
Write-Host "🐳 Building Docker image..." -ForegroundColor Yellow
docker build -t "$DockerImageName`:$DockerTag" .

# Get Docker Hub credentials
Write-Host "🔑 Docker Hub credentials needed:" -ForegroundColor Yellow
$DockerUsername = Read-Host "Docker Hub Username"
$DockerPassword = Read-Host "Docker Hub Password" -AsSecureString
$DockerPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($DockerPassword))

# Tag and push to Docker Hub
Write-Host "📤 Pushing to Docker Hub..." -ForegroundColor Yellow
docker tag "$DockerImageName`:$DockerTag" "$DockerUsername/$DockerImageName`:$DockerTag"
echo $DockerPasswordPlain | docker login --username $DockerUsername --password-stdin
docker push "$DockerUsername/$DockerImageName`:$DockerTag"

# Generate secure passwords
$SqlPassword = -join ((65..90) + (97..122) + (48..57) + (33,35,36,37,38,42,43,45,61,63,64) | Get-Random -Count 20 | % {[char]$_})
$JwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | % {[char]$_})

Write-Host "🔐 Generated secure credentials" -ForegroundColor Yellow

# Create parameters file with actual values
$parametersContent = @"
{
    "`$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentParameters.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {
        "subscriptionId": {
            "value": "$SubscriptionId"
        },
        "resourceGroupName": {
            "value": "$ResourceGroup"
        },
        "appName": {
            "value": "$AppName"
        },
        "location": {
            "value": "$Location"
        },
        "hostingPlanName": {
            "value": "$AppName-plan"
        },
        "serverFarmResourceGroup": {
            "value": "$ResourceGroup"
        },
        "linuxFxVersion": {
            "value": "DOCKER|$DockerUsername/$DockerImageName`:$DockerTag"
        },
        "dockerRegistryUsername": {
            "value": "$DockerUsername"
        },
        "dockerRegistryPassword": {
            "value": "$DockerPasswordPlain"
        },
        "sqlServerName": {
            "value": "$AppName-sql"
        },
        "sqlAdministratorLogin": {
            "value": "mymoneyadmin"
        },
        "sqlAdministratorPassword": {
            "value": "$SqlPassword"
        },
        "jwtSecretKey": {
            "value": "$JwtSecret"
        }
    }
}
"@

$parametersContent | Out-File -FilePath "azure-deployment-parameters-actual.json" -Encoding UTF8

# Deploy ARM template
Write-Host "🚀 Deploying to Azure..." -ForegroundColor Yellow
az deployment group create `
    --resource-group $ResourceGroup `
    --template-file azure-deployment-template.json `
    --parameters "@azure-deployment-parameters-actual.json"

# Get the web app URL
$WebAppUrl = az webapp show --resource-group $ResourceGroup --name $AppName --query defaultHostName -o tsv

Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Your application is available at: https://$WebAppUrl" -ForegroundColor Green
Write-Host "📊 SQL Server: $AppName-sql.database.windows.net" -ForegroundColor Yellow
Write-Host "🔑 SQL Admin: mymoneyadmin" -ForegroundColor Yellow
Write-Host "🔐 SQL Password: $SqlPassword" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  Please save these credentials securely!" -ForegroundColor Yellow

# Clean up temporary files
Remove-Item -Path "azure-deployment-parameters-actual.json" -Force -ErrorAction SilentlyContinue

Write-Host "🎉 Deployment script completed!" -ForegroundColor Green 