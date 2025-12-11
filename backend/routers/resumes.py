"""
Resume endpoints for managing user resumes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime
from backend.database.firestore_client import firestore_client
from backend.routers.auth import get_current_user
import uuid

router = APIRouter(prefix="/user", tags=["resumes"])

@router.post("/resumes")
async def create_resume(resume_data: dict, current_user: dict = Depends(get_current_user)):
    """Create a new resume for user"""
    try:
        user_id = current_user.get("user_id")
        
        resume = {
            "id": str(uuid.uuid4()),
            "userId": user_id,
            **resume_data,
            "createdAt": datetime.now().isoformat(),
            "updatedAt": datetime.now().isoformat()
        }
        
        # Store in Firestore
        resumes_ref = firestore_client.db.collection('users').document(user_id).collection('resumes')
        resumes_ref.document(resume["id"]).set(resume)
        
        return {
            "success": True,
            "message": "Resume created successfully",
            "resume": resume
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/resumes")
async def get_user_resumes(current_user: dict = Depends(get_current_user)):
    """Get all resumes for user"""
    try:
        user_id = current_user.get("user_id")
        
        resumes_ref = firestore_client.db.collection('users').document(user_id).collection('resumes')
        resumes = [doc.to_dict() for doc in resumes_ref.stream()]
        
        # Sort by createdAt descending
        resumes.sort(key=lambda x: x.get('createdAt', ''), reverse=True)
        
        return {
            "success": True,
            "resumes": resumes
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/resumes/{resume_id}")
async def get_resume(resume_id: str, current_user: dict = Depends(get_current_user)):
    """Get specific resume"""
    try:
        user_id = current_user.get("user_id")
        
        resumes_ref = firestore_client.db.collection('users').document(user_id).collection('resumes')
        resume_doc = resumes_ref.document(resume_id).get()
        
        if not resume_doc.exists:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        return {
            "success": True,
            "resume": resume_doc.to_dict()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/resumes/{resume_id}")
async def update_resume(resume_id: str, resume_data: dict, current_user: dict = Depends(get_current_user)):
    """Update resume"""
    try:
        user_id = current_user.get("user_id")
        
        resumes_ref = firestore_client.db.collection('users').document(user_id).collection('resumes')
        resume_doc = resumes_ref.document(resume_id).get()
        
        if not resume_doc.exists:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        # Update resume
        updated_resume = {
            **resume_doc.to_dict(),
            **resume_data,
            "updatedAt": datetime.now().isoformat()
        }
        
        resumes_ref.document(resume_id).set(updated_resume)
        
        return {
            "success": True,
            "message": "Resume updated successfully",
            "resume": updated_resume
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/resumes/{resume_id}")
async def delete_resume(resume_id: str, current_user: dict = Depends(get_current_user)):
    """Delete resume"""
    try:
        user_id = current_user.get("user_id")
        
        resumes_ref = firestore_client.db.collection('users').document(user_id).collection('resumes')
        resume_doc = resumes_ref.document(resume_id).get()
        
        if not resume_doc.exists:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        # Delete resume
        resumes_ref.document(resume_id).delete()
        
        return {
            "success": True,
            "message": "Resume deleted successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/resumes/{resume_id}/set-primary")
async def set_primary_resume(resume_id: str, current_user: dict = Depends(get_current_user)):
    """Set a resume as primary (for job matching)"""
    try:
        user_id = current_user.get("user_id")
        
        resumes_ref = firestore_client.db.collection('users').document(user_id).collection('resumes')
        resume_doc = resumes_ref.document(resume_id).get()
        
        if not resume_doc.exists:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        # Update user's primary resume
        user_ref = firestore_client.db.collection('users').document(user_id)
        resume_data = resume_doc.to_dict()
        
        # Update user profile with resume details for job matching
        user_ref.update({
            "primaryResumeId": resume_id,
            "skills": resume_data.get("skills", []),
            "headline": resume_data.get("headline", ""),
            "experience": resume_data.get("experience", []),
            "education": resume_data.get("education", []),
            "certifications": resume_data.get("certifications", []),
            "languages": resume_data.get("languages", []),
            "bio": resume_data.get("bio", ""),
            "updatedAt": datetime.now().isoformat()
        })
        
        return {
            "success": True,
            "message": "Primary resume updated successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
