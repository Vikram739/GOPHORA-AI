# 🚀 Pre-Deployment Checklist

Use this checklist before deploying to production.

## ✅ Security

- [ ] `.env` and `serviceAccount.json` are in `.gitignore` (never commit these!)
- [ ] Real API keys are NOT committed to git
- [ ] `JWT_SECRET` is a strong random string (min 32 characters)
- [ ] Production `ALLOWED_ORIGINS` is set to your frontend URL (not `*`)
- [ ] Share `.env` securely with team members (encrypted/private)

## ✅ Environment Variables

### Backend (Railway/Render)
- [ ] `JWT_SECRET` - Strong secret key
- [ ] `JWT_ALGORITHM` - Set to `HS256`
- [ ] `GEMINI_API_KEY` - Your Gemini API key
- [ ] `GEMINI_CHAT_MODEL` - `models/gemini-2.5-flash`
- [ ] `GEMINI_EMBED_MODEL` - `models/text-embedding-004`
- [ ] `FIREBASE_CREDENTIALS_JSON` - Full JSON from serviceAccount.json
- [ ] `ENVIRONMENT` - Set to `production`
- [ ] `LOG_LEVEL` - Set to `INFO`
- [ ] `ALLOWED_ORIGINS` - Your Vercel URL (e.g., `https://your-app.vercel.app`)

### Frontend (Vercel)
- [ ] `VITE_API_URL` - Your backend URL (Railway/Render)

### GitHub Secrets (for CI/CD)
- [ ] `VERCEL_TOKEN` - From Vercel account settings
- [ ] `VERCEL_ORG_ID` - From Vercel project settings
- [ ] `VERCEL_PROJECT_ID` - From Vercel project settings
- [ ] `VITE_API_URL` - Your backend URL

## ✅ Code Ready

- [ ] All changes committed to git
- [ ] Pushed to `main` branch
- [ ] No syntax errors (`python -m compileall backend`)
- [ ] Frontend builds successfully (`npm run build`)

## ✅ Firebase Setup

- [ ] Firestore database created
- [ ] Service account JSON downloaded
- [ ] Firestore rules configured (if needed)

## ✅ Platform Accounts

- [ ] Vercel account created
- [ ] Railway or Render account created
- [ ] GitHub account connected to both

## ✅ After Deployment

- [ ] Backend health check works: `/health` endpoint
- [ ] Frontend loads without errors
- [ ] Can register new user
- [ ] Can login
- [ ] API calls work (check browser console)
- [ ] Jobs appear (wait 10 minutes for scrapers)

## 🔥 Deploy Commands

```bash
# Test build locally first
npm run build                    # Frontend
python -m compileall backend     # Backend syntax check

# Commit and push
git add .
git commit -m "Ready for deployment"
git push origin main

# CI/CD will auto-deploy!
```

## 📝 URLs to Save

After deployment, save these URLs:

- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-backend.up.railway.app
- **Backend Health**: https://your-backend.up.railway.app/health
- **Backend Docs**: https://your-backend.up.railway.app/docs

## 🆘 If Something Breaks

1. Check platform logs (Vercel/Railway/Render dashboards)
2. Verify all environment variables are set
3. Test backend `/health` endpoint
4. Check browser console for frontend errors
5. Review GitHub Actions logs

## 🎉 Success Criteria

- ✅ Frontend loads at Vercel URL
- ✅ Backend `/health` returns `{"status":"healthy"}`
- ✅ Can register and login
- ✅ Jobs appear in dashboard
- ✅ Push to main auto-deploys both frontend and backend
