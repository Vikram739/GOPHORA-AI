"""
Jobs Router
Endpoints for retrieving personalized and general jobs
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import List, Optional
import logging

from backend.database.firestore_client import firestore_client
from backend.routers.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/jobs", tags=["Jobs"])

# ==================== PYDANTIC MODELS ====================

class JobResponse(BaseModel):
    jobId: str
    jobTitle: str
    company: Optional[str] = None
    location: Optional[str] = None
    description: str
    requirements: Optional[str] = ""
    salary: Optional[str] = ""
    sourceLink: str
    source: str
    scrapedAt: Optional[str] = None
    isActive: bool = True
    
    # For personalized jobs
    aiValidationScore: Optional[float] = None
    aiReasoning: Optional[str] = None
    skillMatches: Optional[List[str]] = []
    skillGaps: Optional[List[str]] = []
    
    # For general jobs
    estimatedPay: Optional[str] = None
    duration: Optional[str] = None
    category: Optional[str] = None

class JobsListResponse(BaseModel):
    jobs: List[JobResponse]
    total: int
    page: int
    limit: int
    has_more: bool

# ==================== ENDPOINTS ====================

@router.get("/personalized", response_model=JobsListResponse)
async def get_personalized_jobs(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """
    Get personalized jobs for the authenticated user
    
    - Requires authentication
    - Returns jobs matched to user's skills and interests
    - Includes AI validation scores
    - Paginated results
    """
    try:
        user_id = current_user.get('userId')
        offset = (page - 1) * limit
        
        # Get jobs from Firestore
        jobs = await firestore_client.get_personalized_jobs(
            user_id,
            limit=limit + 1,  # Get one extra to check if there are more
            offset=offset,
            active_only=True
        )
        
        # Check if there are more jobs
        has_more = len(jobs) > limit
        if has_more:
            jobs = jobs[:limit]
        
        # Convert Firestore timestamps to strings
        for job in jobs:
            if 'scrapedAt' in job and job['scrapedAt']:
                job['scrapedAt'] = str(job['scrapedAt'])
        
        logger.info(f"Retrieved {len(jobs)} personalized jobs for user {user_id}")
        
        return {
            "jobs": jobs,
            "total": len(jobs),
            "page": page,
            "limit": limit,
            "has_more": has_more
        }
        
    except Exception as e:
        logger.error(f"Error fetching personalized jobs: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch personalized jobs"
        )

@router.get("/general", response_model=JobsListResponse)
async def get_general_jobs(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    category: Optional[str] = Query(None)
):
    """
    Get general gig jobs available to all users
    
    - No authentication required
    - Returns no-skill/low-skill temporary jobs
    - Filter by category (optional)
    - Paginated results
    """
    try:
        offset = (page - 1) * limit
        
        # Get jobs from Firestore
        jobs = await firestore_client.get_general_jobs(
            limit=limit + 1,
            offset=offset,
            category=category,
            active_only=True
        )
        
        # Check if there are more jobs
        has_more = len(jobs) > limit
        if has_more:
            jobs = jobs[:limit]
        
        # Convert Firestore timestamps to strings
        for job in jobs:
            if 'scrapedAt' in job and job['scrapedAt']:
                job['scrapedAt'] = str(job['scrapedAt'])
        
        logger.info(f"Retrieved {len(jobs)} general jobs")
        
        return {
            "jobs": jobs,
            "total": len(jobs),
            "page": page,
            "limit": limit,
            "has_more": has_more
        }
        
    except Exception as e:
        logger.error(f"Error fetching general jobs: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch general jobs"
        )

@router.get("/categories", response_model=List[str])
async def get_job_categories():
    """
    Get list of available job categories
    """
    categories = [
        "Technology & IT",
        "Creative & Design",
        "Data Entry & Admin",
        "Customer Service",
        "Sales & Marketing",
        "Writing & Content",
        "Education & Training",
        "Healthcare",
        "Finance & Accounting",
        "Survey & Research",
        "Testing & QA",
        "Other"
    ]
    
    return categories

@router.get("/stats", response_model=dict)
async def get_job_stats(current_user: dict = Depends(get_current_user)):
    """
    Get job statistics for the authenticated user
    
    - Total personalized jobs available
    - Total general jobs available
    - New jobs today
    """
    try:
        user_id = current_user.get('userId')
        
        # Get personalized jobs count
        personalized_jobs = await firestore_client.get_personalized_jobs(
            user_id,
            limit=1000,
            active_only=True
        )
        
        # Get general jobs count
        general_jobs = await firestore_client.get_general_jobs(
            limit=1000,
            active_only=True
        )
        
        return {
            "personalized_jobs_count": len(personalized_jobs),
            "general_jobs_count": len(general_jobs),
            "total_jobs": len(personalized_jobs) + len(general_jobs)
        }
        
    except Exception as e:
        logger.error(f"Error fetching job stats: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch job statistics"
        )
