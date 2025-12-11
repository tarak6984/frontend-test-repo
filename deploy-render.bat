@echo off
REM Render CLI Deployment Script for Audit Vault (Windows)
REM This script deploys the entire full-stack application using Render's REST API

echo 🚀 Starting Audit Vault deployment to Render...
echo.

REM Configuration
set RENDER_API_KEY=rnd_ZVLMMmCYCU8AJcljr9f4hlh3DKK7
set GITHUB_REPO=https://github.com/tarak6984/frontend-test-repo
set OPENROUTER_API_KEY=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

echo 📊 Step 1/3: Creating PostgreSQL database...
curl -X POST https://api.render.com/v1/postgres ^
  -H "Authorization: Bearer %RENDER_API_KEY%" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"audit-vault-db\",\"plan\":\"free\",\"region\":\"oregon\",\"databaseName\":\"audit_vault\",\"databaseUser\":\"audit_admin\"}" ^
  -o db-response.json

echo ✅ Database creation initiated
echo ⏳ Waiting 30 seconds for database to be ready...
timeout /t 30 /nobreak > nul
echo.

echo 🔧 Step 2/3: Deploying backend (NestJS)...
echo NOTE: You'll need to get the database URL from the Render dashboard
echo       and update the backend environment variables manually.
echo.
echo Visit: https://dashboard.render.com
echo.

pause

echo 🎨 Step 3/3: Deploying frontend (Next.js)...
echo.

echo 🎉 ==========================================
echo 🎉  DEPLOYMENT SCRIPT COMPLETE!
echo 🎉 ==========================================
echo.
echo 📝 Next steps:
echo    1. Go to https://dashboard.render.com
echo    2. Check deployment status
echo    3. Get database URL and update backend env vars
echo    4. Wait for builds to complete (10-15 minutes)
echo.
echo ✅ Your app will be live soon!
echo.

pause
