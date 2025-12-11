#!/bin/bash

# Render CLI Deployment Script for Audit Vault
# This script deploys the entire full-stack application using Render's REST API

set -e  # Exit on error

echo "🚀 Starting Audit Vault deployment to Render..."
echo ""

# Configuration
RENDER_API_KEY="rnd_ZVLMMmCYCU8AJcljr9f4hlh3DKK7"
GITHUB_REPO="https://github.com/tarak6984/frontend-test-repo"
OPENROUTER_API_KEY="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"

# Step 1: Create PostgreSQL Database
echo "📊 Step 1/3: Creating PostgreSQL database..."
DB_RESPONSE=$(curl -s -X POST https://api.render.com/v1/postgres \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "audit-vault-db",
    "plan": "free",
    "region": "oregon",
    "databaseName": "audit_vault",
    "databaseUser": "audit_admin"
  }')

DB_ID=$(echo $DB_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "✅ Database created with ID: $DB_ID"
echo "⏳ Waiting for database to be ready (30 seconds)..."
sleep 30

# Get database connection string
DB_INFO=$(curl -s -X GET "https://api.render.com/v1/postgres/$DB_ID" \
  -H "Authorization: Bearer $RENDER_API_KEY")

DB_URL=$(echo $DB_INFO | grep -o '"connectionString":"[^"]*"' | cut -d'"' -f4)
echo "✅ Database URL obtained"
echo ""

# Step 2: Deploy Backend
echo "🔧 Step 2/3: Deploying backend (NestJS)..."
BACKEND_RESPONSE=$(curl -s -X POST https://api.render.com/v1/services \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"web_service\",
    \"name\": \"audit-vault-backend\",
    \"repo\": \"$GITHUB_REPO\",
    \"branch\": \"main\",
    \"rootDir\": \"backend\",
    \"plan\": \"free\",
    \"region\": \"oregon\",
    \"buildCommand\": \"npm install && npx prisma generate && npx prisma migrate deploy && npm run build\",
    \"startCommand\": \"npm run start:prod\",
    \"envVars\": [
      {\"key\": \"DATABASE_URL\", \"value\": \"$DB_URL\"},
      {\"key\": \"JWT_SECRET\", \"value\": \"audit-vault-super-secret-jwt-key-2024\"},
      {\"key\": \"PORT\", \"value\": \"3000\"},
      {\"key\": \"NODE_ENV\", \"value\": \"production\"},
      {\"key\": \"OPENROUTER_API_KEY\", \"value\": \"$OPENROUTER_API_KEY\"}
    ]
  }")

BACKEND_ID=$(echo $BACKEND_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "✅ Backend service created with ID: $BACKEND_ID"
echo "⏳ Backend is building... (this takes 5-10 minutes)"
echo ""

# Get backend URL
sleep 10
BACKEND_INFO=$(curl -s -X GET "https://api.render.com/v1/services/$BACKEND_ID" \
  -H "Authorization: Bearer $RENDER_API_KEY")

BACKEND_URL=$(echo $BACKEND_INFO | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
echo "✅ Backend URL: $BACKEND_URL"
echo ""

# Step 3: Deploy Frontend
echo "🎨 Step 3/3: Deploying frontend (Next.js)..."
FRONTEND_RESPONSE=$(curl -s -X POST https://api.render.com/v1/services \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"web_service\",
    \"name\": \"audit-vault-frontend\",
    \"repo\": \"$GITHUB_REPO\",
    \"branch\": \"main\",
    \"rootDir\": \"frontend\",
    \"plan\": \"free\",
    \"region\": \"oregon\",
    \"buildCommand\": \"npm install && npm run build\",
    \"startCommand\": \"npm start\",
    \"envVars\": [
      {\"key\": \"NEXT_PUBLIC_API_URL\", \"value\": \"$BACKEND_URL\"},
      {\"key\": \"NODE_ENV\", \"value\": \"production\"}
    ]
  }")

FRONTEND_ID=$(echo $FRONTEND_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "✅ Frontend service created with ID: $FRONTEND_ID"
echo "⏳ Frontend is building... (this takes 5-10 minutes)"
echo ""

# Get frontend URL
sleep 10
FRONTEND_INFO=$(curl -s -X GET "https://api.render.com/v1/services/$FRONTEND_ID" \
  -H "Authorization: Bearer $RENDER_API_KEY")

FRONTEND_URL=$(echo $FRONTEND_INFO | grep -o '"url":"[^"]*"' | cut -d'"' -f4)

echo ""
echo "🎉 =========================================="
echo "🎉  DEPLOYMENT INITIATED SUCCESSFULLY!"
echo "🎉 =========================================="
echo ""
echo "📊 Database:  $DB_ID"
echo "🔧 Backend:   $BACKEND_URL"
echo "🎨 Frontend:  $FRONTEND_URL"
echo ""
echo "⏳ Services are building and deploying..."
echo "   This process takes 10-15 minutes total."
echo ""
echo "📝 Monitor deployment status at:"
echo "   https://dashboard.render.com"
echo ""
echo "✅ Once deployed, your app will be live at:"
echo "   $FRONTEND_URL"
echo ""
echo "🔑 Test credentials:"
echo "   Admin: admin@auditvault.com / password123"
echo "   Manager: manager@funds.com / password123"
echo ""
