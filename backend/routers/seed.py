"""
Seed Jobs Endpoint - Instantly populate database for testing
Bypasses all checks to ensure data gets stored
"""
from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/seed", tags=["Debug/Seed"])

@router.post("/populate-user-jobs/{user_id}")
async def seed_user_jobs(user_id: str, count: int = 500):
    """
    SEED: Instantly add 500+ jobs to a user's personalized jobs
    Bypasses ALL validation/checks for testing
    """
    try:
        from backend.database.firestore_client import firestore_client
        
        # Get user
        user = await firestore_client.get_user(user_id)
        if not user:
            raise HTTPException(status_code=404, detail=f"User {user_id} not found")
        
        # Generate realistic jobs directly (no validation)
        jobs_added = 0
        companies = ["Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix", "Adobe", "Salesforce", 
                    "Oracle", "IBM", "Accenture", "Deloitte", "PwC", "EY", "KPMG", "Cisco", "Intel", 
                    "HP", "Dell", "VMware", "Shopify", "Stripe", "Figma", "Notion", "Slack"]
        
        roles = ["Developer", "Engineer", "Designer", "Manager", "Analyst", "Consultant", "Architect", 
                "Lead", "Specialist", "Associate", "Senior", "Junior", "Entry Level"]
        
        skills = user.get('skills', ['Python', 'JavaScript', 'React'])
        
        for i in range(count):
            job = {
                'jobTitle': f"{roles[i % len(roles)]} - {skills[i % len(skills)]}",
                'company': companies[i % len(companies)],
                'location': user.get('location', 'Remote'),
                'description': f"Exciting opportunity for {skills[i % len(skills)]} professionals. Join our innovative team at {companies[i % len(companies)]}.",
                'requirements': f"{skills[i % len(skills)]} experience required",
                'salary': f"${60 + (i % 80)}k - ${100 + (i % 100)}k",
                'sourceLink': f"https://example.com/job{i}",
                'source': 'Seeded',
                'aiValidationScore': 85,
                'aiReasoning': 'Seeded job for testing',
                'skillMatches': skills[:3],
                'skillGaps': []
            }
            
            try:
                await firestore_client.add_personalized_job(user_id, job)
                jobs_added += 1
            except Exception as e:
                logger.error(f"Failed to add job {i}: {e}")
                continue
        
        logger.info(f"✅ SEEDED {jobs_added} jobs for user {user_id}")
        
        return {
            "success": True,
            "message": f"✅ Seeded {jobs_added} personalized jobs for user {user_id}",
            "jobs_added": jobs_added,
            "user_skills": skills
        }
        
    except Exception as e:
        logger.error(f"Seed failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/populate-general-jobs")
async def seed_general_jobs(count: int = 200):
    """
    SEED: Instantly add 200+ general jobs to database
    """
    try:
        from backend.database.firestore_client import firestore_client
        
        jobs_added = 0
        sources = ["RemoteOK", "Upwork", "Fiverr", "LinkedIn", "Indeed", "Arbeitnow"]
        categories = ["Tech", "Data Entry", "Writing", "Design", "Remote", "Freelance"]
        
        for i in range(count):
            job = {
                'jobTitle': f"Job Opportunity #{i+1} - {categories[i % len(categories)]}",
                'company': f"Company {i+1}",
                'location': "Remote",
                'description': f"Great opportunity in {categories[i % len(categories)]} field. Work from anywhere.",
                'salary': f"${5 + (i % 50)}/hour",
                'sourceLink': f"https://example.com/general/{i}",
                'source': sources[i % len(sources)],
                'category': categories[i % len(categories)]
            }
            
            try:
                await firestore_client.add_general_job(job)
                jobs_added += 1
            except Exception as e:
                logger.warning(f"Failed to add general job {i}: {e}")
                continue
        
        logger.info(f"✅ SEEDED {jobs_added} general jobs")
        
        return {
            "success": True,
            "message": f"✅ Seeded {jobs_added} general jobs",
            "jobs_added": jobs_added
        }
        
    except Exception as e:
        logger.error(f"Seed failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/debug/user/{user_id}")
async def debug_user_jobs(user_id: str):
    """
    DEBUG: Check what jobs a user actually has
    """
    try:
        from backend.database.firestore_client import firestore_client
        
        user = await firestore_client.get_user(user_id)
        if not user:
            raise HTTPException(status_code=404, detail=f"User {user_id} not found")
        
        personalized_jobs = await firestore_client.get_personalized_jobs(user_id, limit=1000)
        
        return {
            "user_id": user_id,
            "user_profile": {
                "email": user.get('email'),
                "skills": user.get('skills'),
                "interests": user.get('interests'),
                "experience": user.get('experience'),
                "location": user.get('location')
            },
            "personalized_jobs_count": len(personalized_jobs),
            "sample_jobs": personalized_jobs[:3] if personalized_jobs else []
        }
        
    except Exception as e:
        logger.error(f"Debug failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
