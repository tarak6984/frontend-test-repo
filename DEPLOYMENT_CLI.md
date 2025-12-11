# Render CLI Deployment Guide

## 🚀 Deploy Using Command Line (100% CLI)

This guide shows you how to deploy your entire Audit Vault application using only the command line.

---

## Option 1: Using render.yaml (Recommended - Easiest)

Since we already have `render.yaml`, Render will auto-deploy everything when you connect your repo!

### Steps:

1. **Push render.yaml to GitHub** (already done ✅)
   ```bash
   git add render.yaml
   git commit -m "feat: add Render deployment config"
   git push origin main
   ```

2. **Connect Repository in Render Dashboard**
   - Go to https://dashboard.render.com
   - Click "New" → "Blueprint"
   - Connect your GitHub repo: `tarak6984/frontend-test-repo`
   - Render will automatically detect `render.yaml`
   - Click "Apply"
   - **Done!** All 3 services deploy automatically 🎉

3. **Add OpenRouter API Key**
   - Go to backend service in dashboard
   - Environment → Add: `OPENROUTER_API_KEY` = `your-key`
   - Service will auto-redeploy

---

## Option 2: Pure CLI with Render API

Use Render's REST API to deploy everything via CLI:

### 1. Get Render API Key

```bash
# Go to https://dashboard.render.com/u/settings#api-keys
# Create API key and copy it
export RENDER_API_KEY="your-api-key-here"
```

### 2. Deploy Database

```bash
curl -X POST https://api.render.com/v1/postgres \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "audit-vault-db",
    "plan": "free",
    "region": "oregon",
    "databaseName": "audit_vault",
    "databaseUser": "audit_admin"
  }'
```

### 3. Deploy Backend

```bash
curl -X POST https://api.render.com/v1/services \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "web_service",
    "name": "audit-vault-backend",
    "repo": "https://github.com/tarak6984/frontend-test-repo",
    "branch": "main",
    "rootDir": "backend",
    "plan": "free",
    "region": "oregon",
    "buildCommand": "npm install && npx prisma generate && npx prisma migrate deploy && npm run build",
    "startCommand": "npm run start:prod",
    "envVars": [
      {"key": "DATABASE_URL", "value": "your-db-url"},
      {"key": "JWT_SECRET", "value": "your-secret"},
      {"key": "PORT", "value": "3000"},
      {"key": "NODE_ENV", "value": "production"},
      {"key": "OPENROUTER_API_KEY", "value": "your-key"}
    ]
  }'
```

### 4. Deploy Frontend

```bash
curl -X POST https://api.render.com/v1/services \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "web_service",
    "name": "audit-vault-frontend",
    "repo": "https://github.com/tarak6984/frontend-test-repo",
    "branch": "main",
    "rootDir": "frontend",
    "plan": "free",
    "region": "oregon",
    "buildCommand": "npm install && npm run build",
    "startCommand": "npm start",
    "envVars": [
      {"key": "NEXT_PUBLIC_API_URL", "value": "https://audit-vault-backend.onrender.com"},
      {"key": "NODE_ENV", "value": "production"}
    ]
  }'
```

---

## Option 3: Easiest - Just Use the Dashboard Once

The **simplest approach**:

1. Go to https://dashboard.render.com
2. Click "New" → "Blueprint"
3. Select your repo
4. Click "Apply"
5. **Done!** Everything deploys automatically from `render.yaml`

This is technically "one click" but uses the web UI briefly.

---

## 🎯 Recommended Approach:

**Use Option 1 (render.yaml + Blueprint)**

Why?
- ✅ Already configured in `render.yaml`
- ✅ One-click deployment
- ✅ Auto-deploys on every git push
- ✅ Infrastructure as code
- ✅ Easiest to maintain

---

## 📝 After Deployment:

Check service URLs:
```bash
# List all services
curl -H "Authorization: Bearer $RENDER_API_KEY" \
  https://api.render.com/v1/services
```

---

## ✅ Summary:

**Easiest:** Use `render.yaml` + Blueprint (1 minute setup)
**Pure CLI:** Use Render API (requires API key)
**Hybrid:** Dashboard for initial setup, CLI for updates

**My recommendation:** Use the Blueprint approach with `render.yaml` - it's the most developer-friendly and you already have the config file! 🚀
