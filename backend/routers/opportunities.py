"""
Opportunities Router
Provides frontend-compatible /api/opportunities endpoints
Maps to jobs functionality and adds provider opportunity management
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from typing import List, Optional
import logging
from datetime import datetime

from backend.database.firestore_client import firestore_client
from backend.routers.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/opportunities", tags=["Opportunities"])

# ==================== PYDANTIC MODELS ====================

class OpportunityResponse(BaseModel):
    id: str
    title: str
    type: str  # job, internship, hackathon, project, collaboration, other
    location: str
    description: str
    requirements: Optional[str] = ""
    company: Optional[str] = None
    tags: Optional[List[str]] = []
    salary: Optional[str] = None
    source: Optional[str] = None
    sourceLink: Optional[str] = None
    createdAt: Optional[str] = None
    isActive: bool = True
    
    # Provider-specific fields
    providerId: Optional[str] = None
    providerName: Optional[str] = None
    
    # AI fields for scraped jobs
    aiValidationScore: Optional[float] = None
    skillMatches: Optional[List[str]] = []

class CreateOpportunityRequest(BaseModel):
    title: str
    type: str
    location: str
    description: str
    requirements: Optional[str] = ""
    tags: Optional[List[str]] = []
    salary: Optional[str] = None
    workMode: Optional[str] = "remote"
    city: Optional[str] = None
    country: Optional[str] = None

class UpdateOpportunityRequest(BaseModel):
    title: Optional[str] = None
    type: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    tags: Optional[List[str]] = None
    salary: Optional[str] = None
    isActive: Optional[bool] = None

# ==================== ENDPOINTS ====================

@router.get("/recommend", response_model=List[OpportunityResponse])
async def get_recommended_opportunities(
    current_user: dict = Depends(get_current_user)
):
    """
    Get personalized job recommendations for the authenticated user
    Maps to /jobs/personalized endpoint
    """
    try:
        user_id = current_user.get('userId')
        
        # Get personalized jobs from Firestore
        jobs = await firestore_client.get_personalized_jobs(
            user_id,
            limit=50,
            active_only=True
        )
        
        # Transform to opportunity format
        opportunities = []
        for job in jobs:
            # Convert timestamp to string
            scraped_at = job.get('scrapedAt')
            if scraped_at and hasattr(scraped_at, 'isoformat'):
                scraped_at = scraped_at.isoformat()
            elif scraped_at:
                scraped_at = str(scraped_at)
            
            opportunity = {
                "id": job.get('jobId', ''),
                "title": job.get('jobTitle', ''),
                "type": "job",  # Default type for scraped jobs
                "location": job.get('location', 'Remote'),
                "description": job.get('description', ''),
                "requirements": job.get('requirements', ''),
                "company": job.get('company', ''),
                "tags": job.get('skillMatches', []),
                "salary": job.get('salary', ''),
                "source": job.get('source', ''),
                "sourceLink": job.get('sourceLink', ''),
                "createdAt": scraped_at,
                "isActive": job.get('isActive', True),
                "aiValidationScore": job.get('aiValidationScore'),
                "skillMatches": job.get('skillMatches', [])
            }
            opportunities.append(OpportunityResponse(**opportunity))
        
        logger.info(f"Retrieved {len(opportunities)} recommended opportunities for user {user_id}")
        return opportunities
        
    except Exception as e:
        logger.error(f"Error fetching recommended opportunities: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch recommended opportunities"
        )

@router.get("/", response_model=List[OpportunityResponse])
async def get_all_opportunities(
    category: Optional[str] = Query(None)
):
    """
    Get all general opportunities (maps to general jobs)
    No authentication required
    """
    try:
        # Get general jobs
        jobs = await firestore_client.get_general_jobs(
            limit=100,
            category=category,
            active_only=True
        )
        
        # Get provider opportunities
        provider_opportunities = await firestore_client.get_all_provider_opportunities(
            limit=100,
            active_only=True
        )
        
        # Transform general jobs
        opportunities = []
        for job in jobs:
            # Convert timestamp to string if needed
            scraped_at = job.get('scrapedAt')
            if scraped_at and hasattr(scraped_at, 'isoformat'):
                scraped_at = scraped_at.isoformat()
            elif scraped_at:
                scraped_at = str(scraped_at)
            
            opportunity = {
                "id": job.get('jobId', ''),
                "title": job.get('jobTitle', ''),
                "type": job.get('category', 'job'),
                "location": job.get('location', 'Remote'),
                "description": job.get('description', ''),
                "requirements": job.get('requirements', ''),
                "company": job.get('company', ''),
                "tags": [],
                "salary": job.get('estimatedPay', ''),
                "source": job.get('source', ''),
                "sourceLink": job.get('sourceLink', ''),
                "createdAt": scraped_at,
                "isActive": job.get('isActive', True)
            }
            opportunities.append(OpportunityResponse(**opportunity))
        
        # Add provider opportunities
        for opp in provider_opportunities:
            # Convert timestamp to string
            created_at = opp.get('createdAt')
            if created_at and hasattr(created_at, 'isoformat'):
                opp['createdAt'] = created_at.isoformat()
            elif created_at:
                opp['createdAt'] = str(created_at)
            
            opportunities.append(OpportunityResponse(**opp))
        
        logger.info(f"Retrieved {len(opportunities)} total opportunities")
        return opportunities
        
    except Exception as e:
        import traceback
        logger.error(f"Error fetching all opportunities: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch opportunities: {str(e)}"
        )

@router.get("/me", response_model=List[OpportunityResponse])
async def get_my_opportunities(
    current_user: dict = Depends(get_current_user)
):
    """
    Get opportunities created by the current provider
    """
    try:
        user_id = current_user.get('userId')
        
        # Get provider's opportunities
        opportunities = await firestore_client.get_provider_opportunities(
            user_id,
            limit=100
        )
        
        logger.info(f"Retrieved {len(opportunities)} opportunities for provider {user_id}")
        return [OpportunityResponse(**opp) for opp in opportunities]
        
    except Exception as e:
        logger.error(f"Error fetching provider opportunities: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch your opportunities"
        )

@router.get("/{opportunity_id}", response_model=OpportunityResponse)
async def get_opportunity_by_id(opportunity_id: str):
    """
    Get a single opportunity by ID
    Checks both provider opportunities and scraped jobs
    """
    try:
        # First check provider opportunities
        opportunity = await firestore_client.get_opportunity_by_id(opportunity_id)
        
        if opportunity:
            return OpportunityResponse(**opportunity)
        
        # If not found in provider opportunities, check general jobs
        general_job = await firestore_client.get_general_job_by_id(opportunity_id)
        
        if general_job:
            opportunity = {
                "id": general_job.get('jobId', ''),
                "title": general_job.get('jobTitle', ''),
                "type": general_job.get('category', 'job'),
                "location": general_job.get('location', 'Remote'),
                "description": general_job.get('description', ''),
                "requirements": general_job.get('requirements', ''),
                "company": general_job.get('company', ''),
                "tags": [],
                "salary": general_job.get('estimatedPay', ''),
                "source": general_job.get('source', ''),
                "sourceLink": general_job.get('sourceLink', ''),
                "createdAt": general_job.get('scrapedAt', ''),
                "isActive": general_job.get('isActive', True)
            }
            return OpportunityResponse(**opportunity)
        
        raise HTTPException(status_code=404, detail="Opportunity not found")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching opportunity {opportunity_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch opportunity"
        )

@router.post("/", response_model=OpportunityResponse)
async def create_opportunity(
    opportunity: CreateOpportunityRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new opportunity (provider only)
    """
    try:
        user_id = current_user.get('userId')
        user = await firestore_client.get_user(user_id)
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Prepare opportunity data
        opportunity_data = {
            "title": opportunity.title,
            "type": opportunity.type,
            "location": opportunity.location,
            "description": opportunity.description,
            "requirements": opportunity.requirements or "",
            "tags": opportunity.tags or [],
            "salary": opportunity.salary,
            "providerId": user_id,
            "providerName": user.get('name', 'Unknown Provider'),
            "isActive": True
        }
        
        # Create in Firestore
        opportunity_id = await firestore_client.create_opportunity(opportunity_data)
        
        # Get created opportunity
        created = await firestore_client.get_opportunity_by_id(opportunity_id)
        
        logger.info(f"Opportunity created by provider {user_id}: {opportunity_id}")
        return OpportunityResponse(**created)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating opportunity: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to create opportunity"
        )

@router.put("/{opportunity_id}", response_model=OpportunityResponse)
async def update_opportunity(
    opportunity_id: str,
    update_data: UpdateOpportunityRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Update an existing opportunity (provider only, own opportunities)
    """
    try:
        user_id = current_user.get('userId')
        
        # Get existing opportunity
        existing = await firestore_client.get_opportunity_by_id(opportunity_id)
        
        if not existing:
            raise HTTPException(status_code=404, detail="Opportunity not found")
        
        # Check ownership
        if existing.get('providerId') != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to update this opportunity")
        
        # Prepare update data (only non-None fields)
        update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
        
        # Update in Firestore
        success = await firestore_client.update_opportunity(opportunity_id, update_dict)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to update opportunity")
        
        # Get updated opportunity
        updated = await firestore_client.get_opportunity_by_id(opportunity_id)
        
        logger.info(f"Opportunity updated by provider {user_id}: {opportunity_id}")
        return OpportunityResponse(**updated)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating opportunity: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to update opportunity"
        )

@router.delete("/{opportunity_id}")
async def delete_opportunity(
    opportunity_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete an opportunity (provider only, own opportunities)
    """
    try:
        user_id = current_user.get('userId')
        
        # Get existing opportunity
        existing = await firestore_client.get_opportunity_by_id(opportunity_id)
        
        if not existing:
            raise HTTPException(status_code=404, detail="Opportunity not found")
        
        # Check ownership
        if existing.get('providerId') != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this opportunity")
        
        # Delete from Firestore
        success = await firestore_client.delete_opportunity(opportunity_id)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete opportunity")
        
        logger.info(f"Opportunity deleted by provider {user_id}: {opportunity_id}")
        return {"message": "Opportunity deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting opportunity: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to delete opportunity"
        )
