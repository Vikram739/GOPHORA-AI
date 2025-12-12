"""
FastAPI Main Application
Job Aggregation Platform with AI-Powered Matching

Integrates:
- Firebase/Firestore database
- JWT authentication
- Personalized and general job scrapers
- LangChain + Gemini AI chatbot
- APScheduler for automated scraping
- Redis caching (optional)
"""
import os
import sys
import logging
from contextlib import asynccontextmanager

# Add parent directory to Python path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from dotenv import load_dotenv

# Import routers
from backend.routers import auth, jobs, chat, user, opportunities, resumes, seed

# Import services
from backend.services.scheduler import scraper_scheduler

load_dotenv()
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

# Lifespan context manager for startup/shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan: startup and shutdown events
    """
    # Startup
    logger.info("Starting Gophora Job Aggregation Platform...")
    
    try:
        # Start background scheduler
        scraper_scheduler.start()
        logger.info("Background scheduler started")
        
    except Exception as e:
        logger.error(f"Startup error: {e}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down...")
    scraper_scheduler.stop()
    logger.info("Background scheduler stopped")

# Create FastAPI app
app = FastAPI(
    title="Gophora Job Aggregation API",
    description="AI-Powered Job Matching Platform with Personalized Recommendations",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add rate limiter state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ==================== MIDDLEWARE ====================

# CORS - Allow all origins in dev, specific in production
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gzip compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all incoming requests"""
    logger.info(f"{request.method} {request.url.path}")
    response = await call_next(request)
    return response

# ==================== ROUTERS ====================

# Include all routers
app.include_router(auth.router)
app.include_router(jobs.router)
app.include_router(chat.router)
app.include_router(user.router)
app.include_router(opportunities.router)
app.include_router(resumes.router)
app.include_router(seed.router)  # DEBUG SEED ENDPOINTS

# ==================== HEALTH CHECK ENDPOINTS ====================

@app.get("/", tags=["Health"])
async def root():
    """Root endpoint"""
    return {
        "message": "Gophora Job Aggregation API",
        "version": "2.0.0",
        "status": "running",
        "docs": "/docs"
    }

@app.get("/health", tags=["Health"])
@limiter.limit("30/minute")
async def health_check(request: Request):
    """
    System health check
    
    - API status
    - Database connectivity
    - Scheduler status
    """
    try:
        from backend.database.firestore_client import firestore_client
        
        # Test Firestore connectivity
        try:
            firestore_client.db.collection('_health_check').limit(1).get()
            db_status = "connected"
        except:
            db_status = "disconnected"
        
        # Get scheduler status
        scheduler_status = scraper_scheduler.get_status()
        
        return {
            "status": "healthy",
            "api": "running",
            "database": db_status,
            "scheduler": scheduler_status
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unhealthy",
                "error": str(e)
            }
        )

@app.get("/health/scrapers", tags=["Health"])
async def scraper_health():
    """
    Detailed scraper status
    
    - Last run times
    - Jobs added counts
    - Error counts
    - Next scheduled runs
    """
    return scraper_scheduler.get_status()

# ==================== ERROR HANDLERS ====================

@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    """Handle 404 errors"""
    return JSONResponse(
        status_code=404,
        content={"detail": "Endpoint not found"}
    )

@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

# ==================== MANUAL SCRAPER TRIGGERS (ADMIN) ====================

@app.post("/admin/scrape/personalized", tags=["Admin"])
async def trigger_personalized_scraper():
    """
    Manually trigger personalized job scraper
    
    - Admin only (add authentication in production)
    - Runs scraper for all users IN BACKGROUND
    """
    try:
        from backend.services.scraper_personalized import personalized_scraper
        
        # Run scraper in background - doesn't block response
        import asyncio
        asyncio.create_task(personalized_scraper.scrape_jobs_for_all_users())
        
        return {
            "message": "✅ Personalized scraper started in background (check logs for progress)",
            "note": "Jobs will be added in 30-60 seconds. Refresh dashboard to see results."
        }
        
    except Exception as e:
        logger.error(f"Manual scraper trigger failed: {e}")
        return JSONResponse(
            status_code=500,
            content={"detail": str(e)}
        )

@app.post("/admin/scrape/general", tags=["Admin"])
async def trigger_general_scraper():
    """
    Manually trigger general job scraper
    
    - Admin only (add authentication in production)
    - Runs IN BACKGROUND
    """
    try:
        from backend.services.scraper_general import general_scraper
        
        # Run scraper in background
        import asyncio
        asyncio.create_task(general_scraper.scrape_all_general_jobs())
        
        return {
            "message": "✅ General scraper started in background (check logs for progress)",
            "note": "Jobs will be added in 20-40 seconds. Refresh dashboard to see results."
        }
        
    except Exception as e:
        logger.error(f"Manual scraper trigger failed: {e}")
        return JSONResponse(
            status_code=500,
            content={"detail": str(e)}
        )

if __name__ == "__main__":
    import uvicorn
    import sys
    import os
    
    # Add parent directory to Python path
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    # Get port from environment (for Railway/Render) or default to 8000
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    uvicorn.run(
        "backend.main:app",
        host=host,
        port=port,
        reload=False,
        log_level="info"
    )
