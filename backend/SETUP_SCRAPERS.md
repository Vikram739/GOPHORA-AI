# 🚀 Scraper Setup Guide

## Quick Start (5 Minutes)

### 1. Environment Variables

Add to your `.env` file:

```env
# AI Providers (at least one required)
OPENAI_API_KEY=sk-proj-...                    # GPT-4 for validation (recommended)
GEMINI_API_KEY=AIzaSy...                      # Gemini fallback

# Firestore
FIREBASE_CREDENTIALS_PATH=./serviceAccount.json

# Optional
GEMINI_CHAT_MODEL=gemini-1.5-flash-latest
```

### 2. Install Dependencies

Already in `requirements.txt`:
```bash
pip install selenium beautifulsoup4 scrapy openai apscheduler fake-useragent webdriver-manager
```

### 3. Verify Installation

```bash
python -c "from selenium import webdriver; print('✅ Selenium OK')"
python -c "from bs4 import BeautifulSoup; print('✅ BeautifulSoup OK')"
python -c "from openai import OpenAI; print('✅ OpenAI OK')"
python -c "from apscheduler.schedulers.asyncio import AsyncIOScheduler; print('✅ APScheduler OK')"
```

### 4. Start Backend

```bash
cd backend
python main.py
```

**Expected output:**
```
INFO:backend.services.scheduler:✅ Scheduler started successfully!
INFO:backend.services.scheduler:📅 Personalized scraper: Every 1 hour (24/7)
INFO:backend.services.scheduler:📅 General scraper: Every 1 hour (24/7)
INFO:backend.services.scheduler:🔒 max_instances=1 ensures scrapers run in background without blocking app
INFO:uvicorn:Uvicorn running on http://127.0.0.1:8000
```

### 5. Verify Scrapers Running

**Check health endpoint:**
```bash
curl http://localhost:8000/health/scrapers
```

**Expected response:**
```json
{
  "status": "running",
  "jobs": [
    {
      "id": "personalized_scraper",
      "name": "Personalized Job Scraper (Hourly)",
      "next_run": "2025-12-03T22:00:00"
    },
    {
      "id": "general_scraper",
      "name": "General Gig Job Scraper (Hourly)",
      "next_run": "2025-12-03T22:30:00"
    }
  ],
  "last_general_run": "2025-12-03T21:30:00",
  "general_jobs_added": 25
}
```

## 🧪 Testing

### Manual Scraper Trigger

```bash
# Trigger general scraper manually
curl -X POST http://localhost:8000/admin/scrape/general

# Response
{"message": "General scraper started in background"}
```

Wait 30 seconds, then check Firestore:
```bash
# Check generalJobs collection
# Should have ~25 new jobs from Upwork, MTurk, surveys
```

### Manual Personalized Scraper

```bash
# Requires users in Firestore with skills defined
curl -X POST http://localhost:8000/admin/scrape/personalized
```

## 🔍 Monitoring

### Check Logs

```bash
# Real-time logs
tail -f backend.log

# Filter scraper logs
grep "Scraping" backend.log
grep "Added" backend.log
grep "Error" backend.log
```

### Health Dashboard

Open browser: `http://localhost:8000/docs`

Navigate to:
- `GET /health` - Overall system health
- `GET /health/scrapers` - Detailed scraper status

## 🐛 Troubleshooting

### Issue: "Scheduler not started"

**Solution:**
```bash
# Check if main.py has scheduler initialization
grep "scraper_scheduler.start()" backend/main.py

# Should output:
# scraper_scheduler.start()
```

### Issue: "No jobs being added"

**Check:**
1. AI API keys configured? `echo $OPENAI_API_KEY`
2. Firestore connected? `curl http://localhost:8000/health`
3. ChromeDriver installed? `webdriver-manager --version`

**Fix:**
```bash
# Reinstall ChromeDriver
pip install --upgrade webdriver-manager
python -c "from webdriver_manager.chrome import ChromeDriverManager; ChromeDriverManager().install()"
```

### Issue: "Selenium headless mode failing"

**Linux/Mac:**
```bash
# Install Chrome dependencies
sudo apt-get install -y chromium-browser chromium-chromedriver
```

**Windows:**
- Chrome should be pre-installed
- If issues, install manually: https://www.google.com/chrome/

### Issue: "OpenAI quota exceeded"

**Fallback to Gemini:**
```env
# Remove/comment OPENAI_API_KEY
# OPENAI_API_KEY=sk-...

# Keep Gemini (free tier)
GEMINI_API_KEY=AIzaSy...
```

System will automatically use Gemini.

## 📊 Expected Behavior

### First Hour
- General scraper runs immediately on startup
- Adds ~25 gig jobs to `generalJobs` collection
- Personalized scraper waits for first user profile

### Ongoing (Every Hour)
- Personalized: Adds 5-20 jobs per user
- General: Adds 10-25 gig jobs
- Cleanup: Removes jobs older than 7 days (daily at 3 AM)

### Firestore Collections

**Check in Firebase Console:**

1. `generalJobs` - Should have jobs with:
   - `jobTitle`, `description`, `sourceLink`
   - `source` = "Upwork", "MTurk", "Survey Junkie"
   - `category` = "Data Entry & Admin", "Freelance & Gig", etc.
   - `scrapedAt` timestamp
   - `isActive: true`

2. `users/{userId}/personalizedJobs` - Should have:
   - Jobs matching user skills
   - `aiValidationScore` >= 60
   - `skillMatches`, `skillGaps` arrays
   - `source` = "LinkedIn", "Indeed", "Glassdoor", "Handshake"

## 🎯 Performance Tips

### Reduce Scraping Time

**Current:** ~2-3 minutes per user  
**Optimize:**
```python
# In scraper_personalized.py
limit=5  # Reduce from 10 to 5 jobs per source
```

### Reduce Memory Usage

**Headless mode already enabled:**
```python
chrome_options.add_argument('--headless')
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')
```

### Reduce API Costs

**Use Gemini instead of GPT-4:**
- GPT-4: $0.01 per 1K tokens
- Gemini: Free tier (60 requests/min)

**Switch:**
```env
# Remove OpenAI key
# OPENAI_API_KEY=...

# Use Gemini
GEMINI_API_KEY=AIzaSy...
```

## 🔐 Security Notes

### Production Deployment

**1. Protect admin endpoints:**
```python
# Add authentication to /admin/* routes
from fastapi import Depends
from backend.routers.auth import get_current_user

@app.post("/admin/scrape/general")
async def trigger_general_scraper(current_user: dict = Depends(get_current_user)):
    # Only admins can trigger
    if current_user.get('role') != 'admin':
        raise HTTPException(403, "Admin only")
    ...
```

**2. Use proxies for scraping:**
```python
# Avoid IP bans
chrome_options.add_argument('--proxy-server=http://proxy.example.com:8080')
```

**3. Rate limiting:**
```python
# Already implemented in main.py
@limiter.limit("30/minute")
async def health_check(request: Request):
    ...
```

## 📈 Scaling

### Horizontal Scaling

**Current:** Single server, sequential scraping  
**Future:** Celery + Redis for distributed tasks

```python
# Install Celery
pip install celery redis

# Create tasks
from celery import Celery
app = Celery('scrapers', broker='redis://localhost:6379')

@app.task
def scrape_user_jobs(user_id):
    ...
```

### Database Optimization

**Add indexes in Firestore:**
```
users/{userId}/personalizedJobs
- Index: scrapedAt (DESC)
- Index: isActive, scrapedAt (DESC)

generalJobs
- Index: category, scrapedAt (DESC)
- Index: isActive, scrapedAt (DESC)
```

## ✅ Verification Checklist

Before deploying to production:

- [ ] Environment variables configured
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] ChromeDriver working (`python -c "from selenium import webdriver; webdriver.Chrome()"`)
- [ ] AI APIs working (test `/health` endpoint)
- [ ] Firestore connected (check `/health` endpoint)
- [ ] Scheduler running (check `/health/scrapers`)
- [ ] General scraper tested (POST `/admin/scrape/general`)
- [ ] Jobs appearing in Firestore
- [ ] Logs show "✅ Added general job: ..."
- [ ] No errors in terminal

## 🆘 Support

**Common Issues:**

1. **"ChromeDriver not found"** → Run `pip install webdriver-manager`
2. **"AI API rate limit"** → Switch from OpenAI to Gemini
3. **"Firestore permission denied"** → Check `serviceAccount.json` path
4. **"Scheduler not running"** → Check `lifespan` function in `main.py`
5. **"Jobs not appearing in UI"** → Check Firestore query filters

**Need Help?**
- Read full docs: `backend/SCRAPING_SYSTEM.md`
- Check health: `http://localhost:8000/health/scrapers`
- View logs: `backend.log`

---

**Setup Time:** ~5 minutes  
**First Results:** Immediate (general scraper runs on startup)  
**Background Running:** 24/7 without app downtime ✅
