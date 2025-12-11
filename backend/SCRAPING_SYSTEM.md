# Gophora Job Scraping System

## 🎯 Overview

Automated 24/7 job scraping system that:
- ✅ Scrapes jobs from **LinkedIn, Indeed, Glassdoor, Handshake, Upwork** and more
- ✅ Uses **AI validation** (GPT-4 + Gemini) to ensure job relevance
- ✅ **Handles duplicates** automatically
- ✅ Runs **every 1 hour** in background without affecting app performance
- ✅ Stores in **separate Firestore collections** (personalized vs general jobs)

## 📊 Architecture

### Two-Tier Scraping System

#### 1. Personalized Job Scraper
**Purpose:** Fetch jobs based on individual user skills/interests  
**Sources:** LinkedIn, Indeed, Glassdoor, Handshake  
**Collection:** `users/{userId}/personalizedJobs`  
**Frequency:** Every 1 hour  
**AI Validation:** Scores jobs 0-100 based on user profile match

#### 2. General Gig Job Scraper
**Purpose:** Fetch low-skill/temporary jobs for all users  
**Sources:** Upwork, Fiverr, MTurk, Survey sites  
**Collection:** `generalJobs` (shared by all users)  
**Frequency:** Every 1 hour (offset by 30min)  
**AI Validation:** Categorizes jobs automatically

## 🔧 Technical Implementation

### Web Scraping Stack

```python
# Core Libraries
- Selenium WebDriver (headless Chrome)
- BeautifulSoup4 (HTML parsing)
- Scrapy (optional, for advanced scraping)
- Fake-UserAgent (anti-detection)
```

### AI Validation Stack

```python
# Dual AI Provider System
- OpenAI GPT-4 Turbo (primary)
- Google Gemini 1.5 Flash (fallback)

# Validation Features
- Job relevance scoring (0-100)
- Skill gap analysis
- Duplicate detection
- Auto-categorization
```

### Background Processing

```python
# APScheduler (AsyncIOScheduler)
- Non-blocking execution (max_instances=1)
- Runs 24/7 without app downtime
- Error recovery & retry logic
- Health monitoring endpoints
```

## 📁 File Structure

```
backend/
├── services/
│   ├── scraper_personalized.py  # LinkedIn, Indeed, Glassdoor, Handshake
│   ├── scraper_general.py       # Upwork, MTurk, Surveys
│   ├── ai_validator.py          # GPT-4 + Gemini validation
│   └── scheduler.py             # Background job runner
├── database/
│   └── firestore_client.py      # DB operations
└── main.py                      # Scheduler initialization
```

## 🚀 How It Works

### Personalized Scraper Flow

1. **Get User Profile** → Fetch skills, interests, experience from Firestore
2. **Build Search Query** → Combine top 3 skills as keywords
3. **Scrape Multiple Sources:**
   - Indeed: 10 jobs
   - LinkedIn: 8 jobs
   - Glassdoor: 5 jobs
   - Handshake: 5 jobs (if entry-level)
4. **AI Validation:**
   - Call GPT-4/Gemini with user profile
   - Get relevance score (0-100)
   - Extract skill matches & gaps
5. **Duplicate Check:** Query Firestore by `jobTitle + company`
6. **Store if Relevant:** Only save jobs with score ≥ 60

### General Scraper Flow

1. **Scrape Gig Sources:**
   - Upwork: 15 jobs (real scraping)
   - MTurk: 10 jobs (sample data)
   - Survey sites: 5 jobs (curated)
2. **AI Categorization:** GPT-4/Gemini assigns category
3. **Duplicate Check:** Query by `sourceLink`
4. **Store All:** Add to `generalJobs` collection

## ⚙️ Configuration

### Environment Variables

```env
# AI Providers
OPENAI_API_KEY=sk-...          # GPT-4 for validation
GEMINI_API_KEY=AI...           # Gemini fallback

# Firestore
FIREBASE_CREDENTIALS_PATH=./serviceAccount.json

# Models
GEMINI_CHAT_MODEL=gemini-1.5-flash-latest
```

### Scheduler Settings

```python
# In scheduler.py
PERSONALIZED_INTERVAL = 1 hour  # Runs every 60 minutes
GENERAL_INTERVAL = 1 hour       # Offset by 30min
CLEANUP_SCHEDULE = Daily 3 AM   # Deactivate old jobs
```

## 📊 Firestore Collections

### Personalized Jobs Schema

```firestore
users/{userId}/personalizedJobs/{jobId}
{
  jobTitle: "Senior Python Developer",
  company: "Google",
  location: "Remote",
  description: "Build scalable systems...",
  requirements: "5+ years Python",
  salary: "$150k-$200k",
  sourceLink: "https://linkedin.com/jobs/...",
  source: "LinkedIn",
  category: "Technology & IT",
  
  // AI Validation Fields
  aiValidationScore: 92,
  aiReasoning: "Strong match - Python, Django, AWS skills align",
  skillMatches: ["Python", "Django", "AWS"],
  skillGaps: ["Kubernetes"],
  
  // Metadata
  scrapedAt: Timestamp,
  isActive: true
}
```

### General Jobs Schema

```firestore
generalJobs/{jobId}
{
  jobTitle: "Data Entry - Simple Tasks",
  description: "Copy/paste information...",
  estimatedPay: "$5-10/hour",
  duration: "Less than 1 week",
  sourceLink: "https://upwork.com/...",
  source: "Upwork",
  category: "Data Entry & Admin",
  company: "Upwork",
  location: "Remote",
  requirements: "No experience required",
  
  scrapedAt: Timestamp,
  isActive: true
}
```

## 🛡️ Anti-Bot Measures

### Implemented Protections

```python
# User-Agent Rotation
user_agent = UserAgent().random

# Headless Browser
chrome_options.add_argument('--headless')
chrome_options.add_argument('--disable-blink-features=AutomationControlled')

# Random Delays
time.sleep(random.uniform(1, 3))  # Between requests
time.sleep(random.uniform(5, 10))  # Between users

# Remove Webdriver Property
driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
```

## 📈 Monitoring & Health Checks

### Endpoints

```bash
# Overall system health
GET /health
{
  "status": "healthy",
  "api": "running",
  "database": "connected",
  "scheduler": {...}
}

# Detailed scraper status
GET /health/scrapers
{
  "status": "running",
  "jobs": [
    {
      "id": "personalized_scraper",
      "name": "Personalized Job Scraper (Hourly)",
      "next_run": "2025-12-03T22:00:00"
    }
  ],
  "last_personalized_run": "2025-12-03T21:00:00",
  "last_general_run": "2025-12-03T21:30:00",
  "personalized_jobs_added": 150,
  "general_jobs_added": 25,
  "error_count": 0
}
```

### Manual Triggers (Admin Only)

```bash
# Force personalized scraper
POST /admin/scrape/personalized

# Force general scraper
POST /admin/scrape/general
```

## 🔄 Job Lifecycle

### Active → Inactive Flow

1. **Job Scraped** → `isActive: true`, `scrapedAt: now()`
2. **7 Days Pass** → Cleanup job runs at 3 AM
3. **Mark Inactive** → `isActive: false` (not deleted, for history)
4. **UI Filter** → Only show `isActive: true` jobs

## 🎯 AI Validation Details

### Relevance Scoring Algorithm

```python
# GPT-4 Prompt
"""
Analyze job match for candidate:
- Skills: [Python, Django, PostgreSQL]
- Experience: 3 years
- Interests: [Backend Development, APIs]

Job: Senior Python Developer @ Google
Description: Build scalable microservices...

Return JSON:
{
  "relevance_score": 85,  # 0-100
  "is_relevant": true,    # score >= 60
  "reasoning": "Strong Python/Django match, AWS gap",
  "skill_matches": ["Python", "Django"],
  "skill_gaps": ["Kubernetes", "AWS"]
}
"""
```

### Duplicate Detection

```python
# Personalized Jobs
duplicate = jobs.where('jobTitle', '==', title)
              .where('company', '==', company)
              .limit(1)

# General Jobs
duplicate = jobs.where('sourceLink', '==', link)
              .limit(1)
```

## 🚨 Error Handling

### Retry Logic

```python
# APScheduler built-in
misfire_grace_time=300  # 5 min grace period
max_instances=1          # Prevent overlapping

# Try/Catch Everywhere
try:
    scrape_jobs()
except Exception as e:
    logger.error(f"Scraping failed: {e}")
    # Continue to next user/source
```

### Fallback Strategies

1. **AI Provider Fails** → Switch from GPT-4 to Gemini
2. **Scraping Fails** → Use cached/sample data
3. **Database Down** → Log errors, retry next hour
4. **Rate Limiting** → Random delays, rotate proxies (future)

## 📋 Maintenance Tasks

### Daily (Automated)
- ✅ Deactivate jobs older than 7 days
- ✅ Clear expired refresh tokens

### Weekly (Manual)
- 🔍 Check scraper health endpoint
- 🔍 Review error logs
- 🔍 Monitor API quota usage

### Monthly (Manual)
- 🔧 Update scraper selectors (sites change layouts)
- 🔧 Add new job sources
- 🔧 Optimize AI prompts

## 🔮 Future Enhancements

### Phase 1 (Next)
- [ ] Add more sources (ZipRecruiter, Monster, CareerBuilder)
- [ ] Implement proxy rotation for anti-blocking
- [ ] Add email notifications for new job matches
- [ ] Build admin dashboard for scraper monitoring

### Phase 2 (Later)
- [ ] Use Scrapy for large-scale scraping
- [ ] Implement Redis caching for jobs
- [ ] Add machine learning for better relevance scoring
- [ ] Build Chrome extension for one-click apply

## 🛠️ Troubleshooting

### Scraper Not Running
```bash
# Check scheduler status
GET /health/scrapers

# Check logs
grep "Scheduler started" backend.log

# Manual trigger
POST /admin/scrape/general
```

### No Jobs Being Added
```bash
# Check AI API keys
echo $OPENAI_API_KEY
echo $GEMINI_API_KEY

# Check Firestore connection
GET /health

# Review scraper logs
grep "Error scraping" backend.log
```

### Duplicate Jobs
```bash
# Firestore has duplicate detection
# If still seeing duplicates:
# 1. Check sourceLink consistency
# 2. Verify job title normalization
# 3. Review duplicate check logic
```

## 📝 Developer Notes

### Adding New Source

1. **Create scraper method** in `scraper_personalized.py` or `scraper_general.py`
2. **Add to main scraping flow**
3. **Test with small limit** first
4. **Add random delays** between requests
5. **Update this documentation**

### Modifying AI Validation

1. **Edit prompt** in `ai_validator.py`
2. **Test with sample jobs**
3. **Monitor relevance scores** in Firestore
4. **Adjust threshold** if needed (currently 60)

## 📞 Support

For issues or questions:
- Check logs: `backend/logs/scraper.log`
- Review Firestore console
- Test scrapers manually via `/admin/scrape/*`
- Monitor health endpoint: `/health/scrapers`

---

**Last Updated:** December 3, 2025  
**Version:** 2.0.0  
**Status:** ✅ Production Ready
