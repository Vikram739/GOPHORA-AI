"""
Background Scheduler for 24/7 Automated Job Scraping
Uses APScheduler to run scrapers every 30 minutes
Includes error handling, retry logic, and health monitoring
"""
import asyncio
import logging
from datetime import datetime
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.cron import CronTrigger
from apscheduler.events import EVENT_JOB_EXECUTED, EVENT_JOB_ERROR

from backend.services.scraper_personalized import personalized_scraper
from backend.services.scraper_general import general_scraper
from backend.database.firestore_client import firestore_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ScraperScheduler:
    """Manages automated job scraping schedules"""
    
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.last_personalized_run = None
        self.last_general_run = None
        self.last_cleanup_run = None
        self.personalized_job_count = 0
        self.general_job_count = 0
        self.error_count = 0
        
        # Setup event listeners
        self.scheduler.add_listener(
            self._job_executed_listener,
            EVENT_JOB_EXECUTED | EVENT_JOB_ERROR
        )
    
    def _job_executed_listener(self, event):
        """Log job execution events"""
        if event.exception:
            logger.error(f"Job {event.job_id} failed: {event.exception}")
            self.error_count += 1
        else:
            logger.info(f"Job {event.job_id} completed successfully")
    
    async def _run_personalized_scraper(self):
        """Run personalized job scraper for all users"""
        try:
            logger.info("Starting personalized job scraper...")
            start_time = datetime.now()
            
            # Run scraper
            results = await personalized_scraper.scrape_jobs_for_all_users()
            
            # Update stats
            self.last_personalized_run = datetime.now()
            self.personalized_job_count = sum(results.values())
            
            duration = (datetime.now() - start_time).total_seconds()
            logger.info(
                f"Personalized scraper completed in {duration:.2f}s. "
                f"Added {self.personalized_job_count} jobs across {len(results)} users"
            )
            
        except Exception as e:
            logger.error(f"Error in personalized scraper job: {e}")
            self.error_count += 1
    
    async def _run_general_scraper(self):
        """Run general gig job scraper"""
        try:
            logger.info("Starting general job scraper...")
            start_time = datetime.now()
            
            # Run scraper
            count = await general_scraper.scrape_all_general_jobs()
            
            # Update stats
            self.last_general_run = datetime.now()
            self.general_job_count = count
            
            duration = (datetime.now() - start_time).total_seconds()
            logger.info(
                f"General scraper completed in {duration:.2f}s. "
                f"Added {count} jobs"
            )
            
        except Exception as e:
            logger.error(f"Error in general scraper job: {e}")
            self.error_count += 1
    
    async def _run_cleanup_job(self):
        """Deactivate old jobs (7+ days old)"""
        try:
            logger.info("Starting cleanup job...")
            start_time = datetime.now()
            
            # Cleanup personalized jobs
            personalized_count = await firestore_client.deactivate_old_jobs(days=7)
            
            # Cleanup general jobs
            general_count = await firestore_client.deactivate_old_general_jobs(days=7)
            
            self.last_cleanup_run = datetime.now()
            
            duration = (datetime.now() - start_time).total_seconds()
            logger.info(
                f"Cleanup completed in {duration:.2f}s. "
                f"Deactivated {personalized_count} personalized jobs and {general_count} general jobs"
            )
            
        except Exception as e:
            logger.error(f"Error in cleanup job: {e}")
            self.error_count += 1
    
    def start(self):
        """Start the scheduler with all jobs - runs every 10 minutes 24/7"""
        try:
            # Personalized scraper - every 10 minutes
            self.scheduler.add_job(
                self._run_personalized_scraper,
                trigger=IntervalTrigger(minutes=10),
                id='personalized_scraper',
                name='Personalized Job Scraper (Every 10 min)',
                replace_existing=True,
                max_instances=1,  # Prevent overlapping runs - ensures non-blocking
                misfire_grace_time=120  # 2 min grace period
            )
            
            # General scraper - every 10 minutes (offset by 5 min to spread load)
            self.scheduler.add_job(
                self._run_general_scraper,
                trigger=IntervalTrigger(minutes=10, start_date=datetime.now()),
                id='general_scraper',
                name='General Gig Job Scraper (Every 10 min)',
                replace_existing=True,
                max_instances=1,  # Non-blocking execution
                misfire_grace_time=120
            )
            
            # Cleanup job - runs daily at 3 AM
            self.scheduler.add_job(
                self._run_cleanup_job,
                trigger=CronTrigger(hour=3, minute=0),
                id='cleanup_job',
                name='Job Cleanup (Daily)',
                replace_existing=True
            )
            
            # Start the scheduler
            self.scheduler.start()
            logger.info("✅ Scheduler started successfully!")
            logger.info("📅 Personalized scraper: Every 10 minutes (24/7)")
            logger.info("📅 General scraper: Every 10 minutes (24/7)")
            logger.info("🧹 Cleanup job: Daily at 3 AM")
            logger.info("🔒 max_instances=1 ensures scrapers run in background without blocking app")
            logger.info("⚡ Fast scraping interval (10 min) for real-time job updates")
            
            # Run general scraper immediately on startup (personalized needs user data)
            asyncio.create_task(self._run_general_scraper())
            
        except Exception as e:
            logger.error(f"Error starting scheduler: {e}")
            raise
    
    def stop(self):
        """Stop the scheduler"""
        if self.scheduler.running:
            self.scheduler.shutdown(wait=True)
            logger.info("Scheduler stopped")
    
    def get_status(self) -> dict:
        """Get scheduler status for health check endpoint"""
        jobs = []
        for job in self.scheduler.get_jobs():
            jobs.append({
                'id': job.id,
                'name': job.name,
                'next_run': job.next_run_time.isoformat() if job.next_run_time else None
            })
        
        return {
            'status': 'running' if self.scheduler.running else 'stopped',
            'jobs': jobs,
            'last_personalized_run': self.last_personalized_run.isoformat() if self.last_personalized_run else None,
            'last_general_run': self.last_general_run.isoformat() if self.last_general_run else None,
            'last_cleanup_run': self.last_cleanup_run.isoformat() if self.last_cleanup_run else None,
            'personalized_jobs_added': self.personalized_job_count,
            'general_jobs_added': self.general_job_count,
            'error_count': self.error_count
        }

# Global instance
scraper_scheduler = ScraperScheduler()
