# Render Full-Stack Deployment Guide

## 🚀 Deploy Audit Vault to Render (100% Free)

This guide will help you deploy the entire Audit Vault application (Frontend + Backend + Database) to Render's free tier.

---

## ✅ What You'll Get (All Free):

- ✅ PostgreSQL Database (256 MB storage)
- ✅ Backend API (NestJS on Node.js)
- ✅ Frontend App (Next.js)
- ✅ Free SSL certificates
- ✅ Auto-deploy from GitHub
- ✅ Custom domains supported

**Note:** Free tier services sleep after 15 minutes of inactivity and wake up on the first request (takes ~30 seconds).

---

## 📋 Prerequisites:

1. GitHub account (you already have this)
2. Render account (free - create at https://render.com)
3. Your repository pushed to GitHub ✅ (already done)

---

## 🎯 Deployment Steps:

### Step 1: Create Render Account

1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with your GitHub account
4. Authorize Render to access your repositories

### Step 2: Deploy PostgreSQL Database

1. Click "New +" → "PostgreSQL"
2. Configure:
   - **Name:** `audit-vault-db`
   - **Database:** `audit_vault`
   - **User:** `audit_admin`
   - **Region:** Oregon (US West) - fastest free region
   - **Plan:** Free
3. Click "Create Database"
4. Wait for database to be created (~2 minutes)
5. **Copy the "Internal Database URL"** (you'll need this)

### Step 3: Deploy Backend (NestJS)

1. Click "New +" → "Web Service"
2. Connect your repository: `tarak6984/frontend-test-repo`
3. Configure:
   - **Name:** `audit-vault-backend`
   - **Region:** Oregon (US West)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:**
     ```bash
     npm install && npx prisma generate && npx prisma migrate deploy && npm run build
     ```
   - **Start Command:**
     ```bash
     npm run start:prod
     ```
   - **Plan:** Free

4. **Add Environment Variables:**
   Click "Advanced" → "Add Environment Variable"
   
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | (Paste the Internal Database URL from Step 2) |
   | `JWT_SECRET` | `your-super-secret-jwt-key-change-this` |
   | `PORT` | `3000` |
   | `NODE_ENV` | `production` |
   | `OPENROUTER_API_KEY` | `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` |

5. Click "Create Web Service"
6. Wait for deployment (~5-10 minutes)
7. **Copy the backend URL** (e.g., `https://audit-vault-backend.onrender.com`)

### Step 4: Update Frontend API URL

Before deploying frontend, we need to update the API URL:

1. In your local project, create `frontend/.env.production`:
   ```env
   NEXT_PUBLIC_API_URL=https://audit-vault-backend.onrender.com
   ```

2. Commit and push:
   ```bash
   git add frontend/.env.production
   git commit -m "feat: add production environment configuration"
   git push origin main
   ```

### Step 5: Deploy Frontend (Next.js)

1. Click "New +" → "Web Service"
2. Connect your repository: `tarak6984/frontend-test-repo`
3. Configure:
   - **Name:** `audit-vault-frontend`
   - **Region:** Oregon (US West)
   - **Branch:** `main`
   - **Root Directory:** `frontend`
   - **Runtime:** Node
   - **Build Command:**
     ```bash
     npm install && npm run build
     ```
   - **Start Command:**
     ```bash
     npm start
     ```
   - **Plan:** Free

4. **Add Environment Variables:**
   
   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_API_URL` | `https://audit-vault-backend.onrender.com` |
   | `NODE_ENV` | `production` |

5. Click "Create Web Service"
6. Wait for deployment (~5-10 minutes)

### Step 6: Seed the Database

After backend is deployed, seed the database with test users:

1. Go to your backend service in Render dashboard
2. Click "Shell" tab
3. Run:
   ```bash
   npx prisma db seed
   ```

---

## 🎉 Your App is Live!

**Frontend URL:** `https://audit-vault-frontend.onrender.com`
**Backend URL:** `https://audit-vault-backend.onrender.com`

### Test Credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@auditvault.com` | `password123` |
| Fund Manager | `manager@funds.com` | `password123` |
| Auditor | `auditor@auditvault.com` | `password123` |

---

## 🔧 Troubleshooting:

### Backend won't start?
- Check logs in Render dashboard
- Verify DATABASE_URL is correct
- Ensure all environment variables are set

### Frontend can't connect to backend?
- Check NEXT_PUBLIC_API_URL is correct
- Verify backend is running
- Check CORS settings in backend

### Database connection errors?
- Use the "Internal Database URL" not "External"
- Verify database is running
- Check Prisma migrations ran successfully

### Services sleeping?
- This is normal on free tier
- First request after 15 min takes ~30 seconds to wake up
- Upgrade to paid tier ($7/month) for always-on services

---

## 💡 Tips:

1. **Auto-Deploy:** Render automatically deploys when you push to GitHub
2. **Custom Domain:** Add your own domain in Render dashboard (free SSL included)
3. **Monitoring:** Check logs in Render dashboard for errors
4. **Upgrade:** If you need always-on services, upgrade to Starter plan ($7/month per service)

---

## 📊 Free Tier Limits:

- **Database:** 256 MB storage, 97 hours/month
- **Web Services:** 750 hours/month (enough for 1 service always-on)
- **Bandwidth:** 100 GB/month
- **Build Minutes:** 500 minutes/month

**For this project:** You'll use 3 services (DB + Backend + Frontend), so they'll sleep after 15 min of inactivity.

---

## 🚀 Alternative: Keep Services Awake

Use a free uptime monitor to ping your services every 10 minutes:

1. Sign up at https://uptimerobot.com (free)
2. Add monitors for:
   - `https://audit-vault-backend.onrender.com`
   - `https://audit-vault-frontend.onrender.com`
3. Set interval to 10 minutes

This keeps your services awake during the day!

---

## ✅ Deployment Checklist:

- [ ] Render account created
- [ ] PostgreSQL database deployed
- [ ] Backend deployed with environment variables
- [ ] Frontend `.env.production` created and pushed
- [ ] Frontend deployed
- [ ] Database seeded with test users
- [ ] Tested login and chat features
- [ ] (Optional) Custom domain configured
- [ ] (Optional) Uptime monitor set up

---

## 🎯 Next Steps After Deployment:

1. **Test the live app** with all features
2. **Share the URL** with Rebel Force for evaluation
3. **Monitor logs** for any errors
4. **Update README** with live demo link

---

## 📝 Update Your README:

Add this to your repository README:

```markdown
## 🌐 Live Demo

**Frontend:** https://audit-vault-frontend.onrender.com
**Backend API:** https://audit-vault-backend.onrender.com

**Test Credentials:**
- Admin: admin@auditvault.com / password123
- Fund Manager: manager@funds.com / password123

**Note:** Free tier services may take 30 seconds to wake up on first request.
```

---

## 🏆 Congratulations!

Your full-stack Audit Vault application is now live and accessible from anywhere in the world! 🎉
