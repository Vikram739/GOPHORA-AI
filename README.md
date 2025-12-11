# Gophora v2 - AI-Powered Job Aggregation Platform

Complete FastAPI backend + React frontend with automated job scraping, AI-powered matching, and intelligent chatbot.

## 🚀 Quick Start (For Your Friends)

### Prerequisites
- **Python 3.10+** installed
- **Node.js 16+** and npm installed
- **Google Chrome** browser (for web scraping)
- **Firebase Project** with Firestore enabled
- **API Keys**: Google Gemini API key (required)

### Step 1: Clone the Repository
```bash
git clone https://github.com/Safia-Liaqat/Gophora-v2.git
cd Gophora-v2/GOPHORA-v2
```

### Step 2: Backend Setup

**Install Python Dependencies:**
```bash
pip install -r backend/requirements.txt
```

**Firebase Setup:**
1. Create Firebase project at https://console.firebase.google.com
2. Enable Firestore Database
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Save as `serviceAccount.json` in project root (`GOPHORA-v2/` folder)

**Create `.env` File:**
Create a `.env` file in the project root with:
```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_ALGORITHM=HS256

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_CHAT_MODEL=gemini-1.5-flash-latest

# OpenAI API (optional)
OPENAI_API_KEY=your_openai_api_key_here

# Firebase
FIREBASE_CREDENTIALS_PATH=./serviceAccount.json
```

### Step 3: Frontend Setup

**Install Node Dependencies:**
```bash
npm install
```

### Step 4: Run the Project

**Option 1: Both Servers Together (Recommended)**

Open **2 separate terminal windows**:

**Terminal 1 - Backend:**
```bash
cd C:\path\to\Gophora-v2\GOPHORA-v2
python -m backend.main
```

**Terminal 2 - Frontend:**
```bash
cd C:\path\to\Gophora-v2\GOPHORA-v2
# Gophora v2 - AI-Powered Job Aggregation Platform

Complete FastAPI backend + React frontend with automated job scraping, AI-powered matching, and intelligent chatbot.

## 🚀 Quick Local Run (share this with friends)

1) **Clone**
```bash
git clone https://github.com/Safia-Liaqat/Gophora-v2.git
cd Gophora-v2/GOPHORA-v2
```

2) **Env & creds** (root folder)
```bash
copy .env.example .env              # on Windows (or: cp .env.example .env)
# edit .env and set at least: JWT_SECRET, GEMINI_API_KEY, VITE_API_URL, FIREBASE_*.
# place your Firebase service account JSON as serviceAccount.json in the root.
```

3) **Backend**
```bash
python -m venv .venv
./.venv/Scripts/activate            # Windows (use source .venv/bin/activate on macOS/Linux)
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

4) **Frontend** (new terminal, still in project root)
```bash
npm install
npm run dev
```

5) **Open**
- Frontend: http://localhost:5173
- Backend API/docs: http://127.0.0.1:8000 (Swagger at /docs)

> Do **not** commit `.env` or `serviceAccount.json`. `VITE_API_URL` must point to your running backend.
- Start command: `python -m backend.main`
- Env vars: `JWT_SECRET`, `JWT_ALGORITHM=HS256`, `GEMINI_API_KEY`, `GEMINI_CHAT_MODEL`, `OPENAI_API_KEY` (optional), **one of** `FIREBASE_CREDENTIALS_PATH` or `FIREBASE_CREDENTIALS_JSON`/`FIREBASE_CREDENTIALS_BASE64`.
- Easiest: set `FIREBASE_CREDENTIALS_BASE64` to base64 of your service account JSON; the app writes `serviceAccount.runtime.json` at runtime.

### Production URLs
- Frontend (Vercel): `https://<your-vercel-app>.vercel.app`
- Backend (Railway): `https://<your-railway-app>.up.railway.app`

## Notes
- Do **not** commit real secrets or `serviceAccount.json`.
- Keep `VITE_API_URL` pointing to the deployed backend in Vercel project settings.
- If running scrapers, ensure Chrome/driver availability in your hosting environment (or disable scrapers for constrained hosts).
```

**Option 2: Docker (Alternative)**
```bash
docker-compose up --build
```

### Step 5: Access the Application

- **Frontend UI**: http://localhost:5173
- **Backend API**: http://127.0.0.1:8000
- **API Docs**: http://127.0.0.1:8000/docs

### ✅ Verify It's Working

1. Open http://localhost:5173 in your browser
2. Register a new account
3. Login with your credentials
4. Check the dashboard for jobs (scrapers run every 10 minutes)

---

## 🚀 Features

### Core Functionality
- **Personalized Job Aggregation**: Scrapes LinkedIn, Indeed, Glassdoor based on user profiles
- **General Gig Jobs**: Aggregates micro-tasks from Upwork, Fiverr, MTurk, survey sites
- **AI Job Validation**: Google Gemini validates job relevance (0-100 score)
- **Smart Chatbot**: LangChain + Gemini with RAG and conversational memory
- **Automated Scraping**: APScheduler runs scrapers every 30 minutes
- **JWT Authentication**: Secure auth with bcrypt and refresh tokens
- **Firebase/Firestore**: NoSQL database for scalability

### Advanced Features
- Semantic job search with OpenAI embeddings
- Deduplication logic for jobs
- Automatic job deactivation after 7 days
- Rate limiting and request logging
- Gzip compression for responses
- Health monitoring endpoints

## 📁 Project Structure

```
backend/
├── main_new.py              # New FastAPI app with scheduler
├── routers/
│   ├── auth.py              # JWT authentication endpoints
│   ├── jobs.py              # Job listing endpoints
│   ├── chat.py              # AI chatbot endpoints
│   └── user.py              # User profile management
├── services/
│   ├── scraper_personalized.py  # LinkedIn, Indeed, Glassdoor
│   ├── scraper_general.py       # Upwork, Fiverr, MTurk, surveys
│   ├── ai_validator.py          # Gemini job validation
│   ├── chatbot.py               # LangChain + Gemini chatbot
│   └── scheduler.py             # APScheduler configuration
├── database/
│   └── firestore_client.py      # Firebase/Firestore client
└── utils/
    ├── jwt_handler.py           # JWT token handling
    └── embeddings.py            # OpenAI embeddings
```

## 🛠️ Installation

### Full Installation Guide

If the Quick Start didn't work, follow these detailed steps:

### 1. System Requirements
- Windows 10/11, macOS 10.15+, or Linux
- Python 3.10 or higher
- Node.js 16.x or higher
- Git
- Google Chrome (latest version)
- 4GB RAM minimum, 8GB recommended

### 2. Clone Repository
```bash
git clone https://github.com/Safia-Liaqat/Gophora-v2.git
cd Gophora-v2/GOPHORA-v2
```

### 3. Backend Setup

**Install Python Dependencies:**
```bash
pip install -r backend/requirements.txt
```

**Alternative (if pip fails):**
```bash
python -m pip install --upgrade pip
pip install -r backend/requirements.txt
```

### 4. Frontend Setup

**Install Node.js Dependencies:**
```bash
npm install
```

**If npm install fails:**
```bash
npm cache clean --force
npm install
```

### 5. Firebase Configuration
1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore Database
3. Generate service account credentials:
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save as `serviceAccount.json` in project root (`GOPHORA-v2/` folder)

### 6. Environment Variables
Create `.env` file in project root (`GOPHORA-v2/` folder):
```bash
pip install -r requirements.txt
```

### Step 3: Firebase Setup
1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore Database
3. Generate service account credentials:
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save as `serviceAccount.json` in project root

### 6. Environment Variables
Create `.env` file in project root (`GOPHORA-v2/` folder):

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ALGORITHM=HS256

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_CHAT_MODEL=gemini-1.5-flash-latest

# OpenAI API (optional)
OPENAI_API_KEY=your_openai_api_key_here

# Firebase
FIREBASE_CREDENTIALS_PATH=./serviceAccount.json
```

### 7. Run the Application

**Method 1: Two Separate Terminals (Recommended)**

**Terminal 1 - Start Backend:**
```bash
# Windows
cd C:\path\to\Gophora-v2\GOPHORA-v2
python -m backend.main

# macOS/Linux
cd /path/to/Gophora-v2/GOPHORA-v2
python3 -m backend.main
```

**Terminal 2 - Start Frontend:**
```bash
# Windows/macOS/Linux
cd /path/to/Gophora-v2/GOPHORA-v2
npm run dev
```

**Method 2: Docker (Alternative)**
```bash
docker-compose up --build
```

### 8. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://127.0.0.1:8000
- **API Documentation**: http://127.0.0.1:8000/docs

### 9. First Time Setup

1. Open http://localhost:5173
2. Click "Register" and create an account
3. Login with your credentials
4. Complete your profile (skills, interests, location)
5. Wait ~10 minutes for scrapers to find personalized jobs

---

## 🔧 Troubleshooting Common Issues

### "ModuleNotFoundError: No module named 'backend'"
**Solution:**
```bash
# Make sure you're in the correct directory
cd GOPHORA-v2
python -m backend.main  # Not just python backend/main.py
```

### Backend won't start
**Solution:**
```bash
# Check if port 8000 is already in use
# Windows:
netstat -ano | findstr :8000

# macOS/Linux:
lsof -i :8000

# Kill the process if needed
```

### Frontend shows "Network Error"
**Solution:**
- Make sure backend is running on http://127.0.0.1:8000
- Check `src/config.js` has correct API URL
- Check browser console for CORS errors

### No jobs appearing
**Solution:**
- Wait 10 minutes (scrapers run automatically)
- Check backend logs for scraper activity
- Verify Firebase credentials are correct
- Ensure Gemini API key is valid

### Selenium/ChromeDriver errors
**Solution:**
```bash
# Update webdriver-manager
pip install --upgrade webdriver-manager

# Install Chrome browser if not installed
```

---

## 🛠️ Development Commands

### Backend Development
```bash
# Run with auto-reload
python -m backend.main

# Run tests
pytest backend/tests/

# Check logs
tail -f logs/backend.log
```

### Frontend Development
```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## 📂 Project File Structure

```
GOPHORA-v2/
├── backend/
│   ├── main.py                    # FastAPI app entry point
│   ├── routers/
│   │   ├── auth.py               # Authentication endpoints
│   │   ├── jobs.py               # Job endpoints
│   │   ├── chat.py               # AI chatbot
│   │   └── user.py               # User profile
│   ├── services/
│   │   ├── scraper_personalized.py  # LinkedIn, Indeed, Glassdoor
│   │   ├── scraper_general.py       # Upwork, MTurk, surveys
│   │   ├── ai_validator.py          # AI job validation
│   │   ├── chatbot.py              # LangChain chatbot
│   │   └── scheduler.py            # Background jobs
│   ├── database/
│   │   └── firestore_client.py      # Firestore operations
│   └── requirements.txt
├── src/
│   ├── pages/
│   │   ├── Landing/              # Landing page components
│   │   ├── Auth/                 # Login/Register
│   │   ├── Seeker/               # Job seeker dashboard
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Opportunities.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── OpportunityDetails.jsx
│   │   └── Provider/             # Job provider dashboard
│   ├── components/
│   │   ├── dashboard/
│   │   │   └── DashboardHome.jsx  # Main dashboard
│   │   ├── ChatAgent/             # AI chat interface
│   │   └── common/                # Shared components
│   ├── services/
│   │   └── api.js                 # API client
│   └── config.js                  # Frontend config
├── .env                            # Environment variables
├── serviceAccount.json             # Firebase credentials
├── package.json
└── README.md

```

---

## 🔐 Environment Variables Explained

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `JWT_SECRET` | Secret key for JWT tokens | Yes | `your-secret-key-here` |
| `GEMINI_API_KEY` | Google Gemini API key | Yes | Get from https://makersuite.google.com/app/apikey |
| `OPENAI_API_KEY` | OpenAI API key | No | For embeddings (optional) |
| `FIREBASE_CREDENTIALS_PATH` | Path to Firebase service account | Yes | `./serviceAccount.json` |

---

## 📝 API Endpoints Reference

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT tokens
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user profile
- `POST /auth/logout` - Logout and invalidate token

### Jobs
- `GET /jobs/personalized` - Get personalized jobs (requires auth)
- `GET /jobs/general` - Get general gig jobs (public)
- `GET /jobs/categories` - List job categories
- `GET /jobs/stats` - Get job statistics (requires auth)

### Chat
- `POST /chat` - Chat with Gophora AI (requires auth)
- `POST /chat/clear-history` - Clear conversation memory
- `GET /chat/history` - Get chat history

### User Profile
- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update profile (skills, interests, experience)
- `DELETE /user/profile` - Delete account

### Health & Monitoring
- `GET /` - API info
- `GET /health` - System health check
- `GET /health/scrapers` - Scraper status and stats

### Admin (Manual Triggers)
- `POST /admin/scrape/personalized` - Trigger personalized scraper
- `POST /admin/scrape/general` - Trigger general scraper

## 🤖 AI Components

### Job Validator (Gemini)
Validates job relevance with structured scoring:
```python
{
    'relevance_score': 85,  # 0-100
    'reasoning': 'Strong match, candidate has required Python skills...',
    'is_relevant': True,
    'skill_matches': ['Python', 'FastAPI', 'SQL'],
    'skill_gaps': ['Docker', 'Kubernetes']
}
```

### Chatbot (LangChain + Gemini)
Features:
- Intent detection (job_search vs. general_qa)
- Semantic job search with embeddings
- Conversational memory per user
- RAG with job database
- Firestore chat history persistence

## 📊 Firestore Collections

```
users/
  {userId}/
    ├── email, password_hash, skills, interests, experience
    ├── createdAt, lastLogin
    ├── personalizedJobs/
    │   └── {jobId}/
    │       ├── jobTitle, company, description, sourceLink
    │       ├── aiValidationScore, aiReasoning
    │       ├── skillMatches, skillGaps
    │       └── scrapedAt, isActive
    ├── chatHistory/
    │   └── {messageId}/
    │       └── role, content, timestamp
    └── refreshTokens/
        └── {tokenId}/
            └── token, expiresAt, isValid

generalJobs/
  {jobId}/
    ├── jobTitle, description, estimatedPay, duration
    ├── sourceLink, category, source
    └── scrapedAt, isActive
```

## ⏰ Automated Scheduler

APScheduler runs background tasks:
- **Personalized Scraper**: Every 30 minutes
- **General Scraper**: Every 30 minutes (offset)
- **Cleanup Job**: Daily at 3 AM (deactivates jobs >7 days old)

Monitor status: `GET /health/scrapers`

## 🔒 Security Features

- Bcrypt password hashing
- JWT with 7-day expiry
- Refresh tokens (30-day expiry)
- Rate limiting (SlowAPI)
- CORS middleware
- Request logging
- Firestore security rules (configure in Firebase Console)

## 🧪 Testing

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest tests/

# Test scrapers
pytest tests/test_scrapers.py -v

# Test chatbot
pytest tests/test_chatbot.py -v
```

## 📈 Performance Optimization

Current implementations:
- ✅ Async/await for all I/O operations
- ✅ Gzip compression
- ✅ Pagination (20 jobs per page)
- ✅ Connection pooling (Firestore)
- ✅ Rate limiting

Future enhancements:
- Redis caching for frequently accessed jobs
- Vector database for faster semantic search
- Job indexing with Algolia
- CDN for static assets

## 🚀 Deployment

### Render.com (Recommended)
1. Connect GitHub repository
2. Create new Web Service
3. Set environment variables
4. Deploy command: `uvicorn backend.main_new:app --host 0.0.0.0 --port $PORT`

### Google Cloud Run
```bash
gcloud run deploy gophora-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Heroku
```bash
heroku create gophora-api
git push heroku main
heroku config:set GEMINI_API_KEY=your_key
```

## 📝 API Documentation

Interactive Swagger docs available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🐛 Troubleshooting

**Firestore connection errors:**
- Verify `serviceAccount.json` path
- Check Firebase project permissions
- Ensure Firestore is enabled

**Scraper failures:**
- LinkedIn/Glassdoor have anti-bot measures (use proxies in production)
- Update CSS selectors if site structure changes
- Check rate limits

**Memory issues:**
- Clear LangChain memory: `POST /chat/clear-history`
- Restart scheduler: `docker-compose restart backend`

## 📚 Additional Resources

- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Google Gemini API](https://ai.google.dev/docs)
- [LangChain Documentation](https://python.langchain.com/docs/get_started/introduction)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

## 📄 License

MIT License

## 👥 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

---

**Built with ❤️ for Gophora - Connecting humans with opportunities through AI**
