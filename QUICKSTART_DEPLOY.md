# 🚀 Quick Deployment Steps

Follow these steps to deploy Gophora v2 for FREE.

## ✅ Step-by-Step Deployment

### 1️⃣ Deploy Backend (Railway) - 5 minutes

1. Go to https://railway.app → Login with GitHub
2. New Project → Deploy from GitHub repo → Select `Gophora-v2`
3. Click on service → Variables → Add all these:
   ```
   JWT_SECRET=your-long-random-secret-key-min-32-chars
   JWT_ALGORITHM=HS256
   GEMINI_API_KEY=your_gemini_key
   GEMINI_CHAT_MODEL=models/gemini-2.5-flash
   GEMINI_EMBED_MODEL=models/text-embedding-004
   FIREBASE_CREDENTIALS_JSON={"type":"service_account",...}
   ENVIRONMENT=production
   LOG_LEVEL=INFO
   ALLOWED_ORIGINS=https://YOUR-USERNAME.github.io
   ```
4. Copy your Railway URL: `https://xxx.up.railway.app`
5. Test: Open `https://xxx.up.railway.app/health` in browser

### 2️⃣ Deploy Frontend (GitHub Pages) - 3 minutes

1. GitHub repo → **Settings** → **Pages**
2. Source: **GitHub Actions** → Save
3. **Secrets and variables** → **Actions** → New secret:
   ```
   Name: VITE_API_URL
   Value: https://xxx.up.railway.app (your Railway URL)
   ```
4. Push to main:
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```
5. Go to **Actions** tab → Watch deployment (2-3 min)
6. Your site: `https://YOUR-USERNAME.github.io/GOPHORA-v2/`

### 3️⃣ Update CORS (1 minute)

1. Railway → Variables → Update `ALLOWED_ORIGINS`:
   ```
   https://YOUR-USERNAME.github.io
   ```
2. Redeploy

### 4️⃣ Test

1. Open: `https://YOUR-USERNAME.github.io/GOPHORA-v2/`
2. Register account
3. Login
4. Check dashboard

## ✅ Done!

**Your URLs:**
- Frontend: `https://YOUR-USERNAME.github.io/GOPHORA-v2/`
- Backend: `https://xxx.up.railway.app`

**Auto-deploy enabled:**
- Every `git push main` → Both frontend & backend update automatically!

**Total time:** ~10 minutes  
**Total cost:** $0/month 🎉

---

For detailed guide, see [DEPLOYMENT.md](./DEPLOYMENT.md)
