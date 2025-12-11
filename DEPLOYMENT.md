# 🚀 Deployment Guide - GitHub Pages + Railway (FREE)

Deploy Gophora v2 completely free with automatic CI/CD.

## Architecture
- **Frontend**: GitHub Pages (Free - unlimited bandwidth)
- **Backend**: Railway (Free $5 credit/month = ~500 hours)
- **Database**: Firebase/Firestore (Free tier - 1GB storage)
- **CI/CD**: GitHub Actions (Free - 2000 minutes/month)

**Total cost: $0/month**

---

## Prerequisites

✅ GitHub account  
✅ Firebase project with Firestore enabled  
✅ Google Gemini API key ([Get it here](https://makersuite.google.com/app/apikey))  
✅ Your code pushed to GitHub main branch  
✅ `.env` file with all secrets

---

## Step 1: Deploy Backend on Railway

### 1.1 Sign up for Railway
- Go to https://railway.app
- Click "Login with GitHub"
- Authorize Railway to access your GitHub

### 1.2 Create New Project
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose your `Gophora-v2` repository
- Railway will auto-detect Python and use `railway.toml`

### 1.3 Set Environment Variables
Click on your service → "Variables" tab → Add these:

```env
JWT_SECRET=your-super-secret-key-change-this-long-random-string-min-32-chars
JWT_ALGORITHM=HS256
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_CHAT_MODEL=models/gemini-2.5-flash
GEMINI_EMBED_MODEL=models/text-embedding-004
FIREBASE_CREDENTIALS_JSON=paste-your-entire-serviceAccount-json-here
ENVIRONMENT=production
LOG_LEVEL=INFO
PORT=8000
HOST=0.0.0.0
ALLOWED_ORIGINS=https://your-github-username.github.io
```

**Important for `FIREBASE_CREDENTIALS_JSON`:**
```powershell
# Windows PowerShell - convert to single line:
Get-Content serviceAccount.json | ConvertFrom-Json | ConvertTo-Json -Compress
```
Copy the output and paste as the value.

**For `ALLOWED_ORIGINS`:**
- Use your GitHub Pages URL: `https://YOUR-USERNAME.github.io`
- If custom domain: use that instead

### 1.4 Deploy
- Click "Deploy"
- Wait 2-3 minutes for build
- Copy your Railway URL: `https://your-app.up.railway.app`
- Test it: `https://your-app.up.railway.app/health`

### 1.5 Enable Auto-Deploy
- Go to Settings → GitHub
- Toggle "Auto-deploy on push to main" ✅
- Now every push to main auto-deploys backend!

---

## Step 2: Deploy Frontend on GitHub Pages

### 2.1 Enable GitHub Pages
1. Go to your GitHub repo: `https://github.com/YOUR-USERNAME/Gophora-v2`
2. Click **Settings** tab
3. Scroll to **Pages** (left sidebar)
4. Under "Build and deployment":
   - **Source**: GitHub Actions
   - Click "Save"

### 2.2 Add GitHub Secret for Backend URL
1. Still in Settings → **Secrets and variables** → **Actions**
2. Click "New repository secret"
3. Add:
   ```
   Name: VITE_API_URL
   Value: https://your-app.up.railway.app
   ```
   (Use your Railway URL from Step 1.4)

### 2.3 Update Vite Config (if needed)
The `vite.config.js` is already configured. But verify the `base` path matches your repo name:

```javascript
// If your repo is github.com/username/Gophora-v2
const base = mode === 'production' ? '/GOPHORA-v2/' : '/'

// If using custom domain or username.github.io directly:
const base = '/'
```

### 2.4 Deploy
```bash
# Commit and push to trigger deployment
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

### 2.5 Watch Deployment
1. Go to **Actions** tab in your GitHub repo
2. Watch the "Deploy to GitHub Pages" workflow
3. Wait 2-3 minutes
4. Your site will be live at: `https://YOUR-USERNAME.github.io/GOPHORA-v2/`

### 2.6 Update Railway CORS
Now that you know your GitHub Pages URL, update Railway:
1. Go to Railway → Variables
2. Update `ALLOWED_ORIGINS` to: `https://YOUR-USERNAME.github.io`
3. Save and redeploy

---

## Step 3: Verify Everything Works

### 3.1 Test Backend
```bash
curl https://your-app.up.railway.app/health
# Should return: {"status":"healthy","api":"running",...}
```

### 3.2 Test Frontend
1. Open: `https://YOUR-USERNAME.github.io/GOPHORA-v2/`
2. Check browser console for errors
3. Register a new account
4. Login and check dashboard

### 3.3 Check CORS
- If you see CORS errors in browser console
- Update Railway `ALLOWED_ORIGINS` to match your exact GitHub Pages URL
- Include `/GOPHORA-v2/` if that's part of your path

---

## 🔥 Full CI/CD Flow

```
You: git push main
    ↓
GitHub Actions:
  ✅ Build frontend with VITE_API_URL
  ✅ Deploy to GitHub Pages
    ↓
Railway:
  ✅ Auto-detect push
  ✅ Rebuild backend
  ✅ Deploy
    ↓
Live in 3-5 minutes! 🚀
```

Every push to `main`:
1. GitHub Actions builds frontend → deploys to GitHub Pages
2. Railway rebuilds backend → redeploys API
3. Both update automatically!

---

## Environment Variables Summary

### Backend (Railway)
```env
JWT_SECRET=long-random-string-min-32-chars
JWT_ALGORITHM=HS256
GEMINI_API_KEY=your_key
GEMINI_CHAT_MODEL=models/gemini-2.5-flash
GEMINI_EMBED_MODEL=models/text-embedding-004
FIREBASE_CREDENTIALS_JSON={"type":"service_account",...}
ENVIRONMENT=production
LOG_LEVEL=INFO
PORT=8000
HOST=0.0.0.0
ALLOWED_ORIGINS=https://your-username.github.io
```

### GitHub Secret (for frontend build)
```env
VITE_API_URL=https://your-app.up.railway.app
```

---

## Custom Domain (Optional)

### For GitHub Pages:
1. Buy domain (Namecheap, Google Domains, etc.)
2. Add CNAME record: `www.yourdomain.com` → `your-username.github.io`
3. GitHub Settings → Pages → Custom domain: `www.yourdomain.com`

### For Railway:
1. Railway Dashboard → Settings → Domains
2. Add custom domain
3. Update DNS with CNAME record

---

## Troubleshooting

### "404 Not Found" on GitHub Pages
- Check repo name matches `base` in `vite.config.js`
- Verify GitHub Pages is enabled (Settings → Pages)
- Wait 5 minutes after first deployment

### "Network Error" in frontend
- Check `VITE_API_URL` secret in GitHub
- Verify Railway backend is running: `/health` endpoint
- Check CORS: `ALLOWED_ORIGINS` in Railway must match GitHub Pages URL

### Backend won't start on Railway
- Check Railway logs for errors
- Verify `FIREBASE_CREDENTIALS_JSON` is valid (no line breaks)
- Ensure all required env vars are set

### CORS errors
- Update Railway `ALLOWED_ORIGINS` to exact GitHub Pages URL
- Don't forget `https://` prefix
- No trailing slash

---

## URLs to Save

After deployment:

- **Frontend**: `https://YOUR-USERNAME.github.io/GOPHORA-v2/`
- **Backend**: `https://your-app.up.railway.app`
- **Backend Health**: `https://your-app.up.railway.app/health`
- **Backend Docs**: `https://your-app.up.railway.app/docs`

---

## Cost Breakdown (FREE!)

| Service | Free Tier | Your Usage | Cost |
|---------|-----------|------------|------|
| GitHub Pages | Unlimited | Frontend hosting | $0 |
| Railway | $5 credit (500 hours) | Backend API | $0* |
| Firebase | 1GB storage, 50K reads/day | Database | $0 |
| GitHub Actions | 2000 minutes/month | CI/CD | $0 |
| **TOTAL** | | | **$0/month** |

*Railway $5 credit renews monthly with student email or stays if you add payment method (not charged unless exceeded).

---

## 🎉 You're Live!

Your app is deployed with full CI/CD:
- Frontend: GitHub Pages (free forever)
- Backend: Railway (free tier)
- Every push to main auto-deploys both!

Share your live URL and enjoy! 🚀
