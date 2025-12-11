"""
User Profile Router
Endpoints for managing user profiles and settings
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import logging

from backend.database.firestore_client import firestore_client
from backend.routers.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/user", tags=["User Profile"])

# ==================== PYDANTIC MODELS ====================

class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    full_name: Optional[str] = None
    skills: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    experience: Optional[str] = None
    company: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = None
    headline: Optional[str] = None
    bio: Optional[str] = None
    photo: Optional[str] = None
    languages: Optional[List[str]] = None

class ProfileResponse(BaseModel):
    userId: str
    email: str
    name: Optional[str] = None
    full_name: Optional[str] = None
    skills: List[str] = []
    interests: List[str] = []
    experience: Optional[str] = None
    company: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = None
    headline: Optional[str] = None
    bio: Optional[str] = None
    photo: Optional[str] = None
    languages: List[str] = []
    createdAt: Optional[str] = None
    lastLogin: Optional[str] = None

# ==================== ENDPOINTS ====================

@router.get("/profile", response_model=ProfileResponse)
async def get_profile(current_user: dict = Depends(get_current_user)):
    """
    Get current user's profile
    
    - Returns full user profile data
    - Requires authentication
    """
    try:
        return {
            "userId": current_user.get('userId'),
            "email": current_user.get('email'),
            "name": current_user.get('name') or current_user.get('full_name'),
            "full_name": current_user.get('full_name'),
            "skills": current_user.get('skills', []),
            "interests": current_user.get('interests', []),
            "experience": current_user.get('experience'),
            "company": current_user.get('company'),
            "website": current_user.get('website'),
            "location": current_user.get('location'),
            "headline": current_user.get('headline'),
            "bio": current_user.get('bio'),
            "photo": current_user.get('photo'),
            "languages": current_user.get('languages', []),
            "createdAt": str(current_user.get('createdAt')) if current_user.get('createdAt') else None,
            "lastLogin": str(current_user.get('lastLogin')) if current_user.get('lastLogin') else None
        }
        
    except Exception as e:
        logger.error(f"Error fetching profile: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch profile"
        )

@router.put("/profile", response_model=ProfileResponse)
async def update_profile(
    update_data: ProfileUpdateRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Update user profile
    
    - Update any profile fields
    - Partial updates supported (only send fields to change)
    - Returns updated profile
    """
    try:
        user_id = current_user.get('userId')
        
        # Prepare update data (exclude None values)
        update_dict = {}
        if update_data.name is not None:
            update_dict['name'] = update_data.name
        if update_data.full_name is not None:
            update_dict['full_name'] = update_data.full_name
        if update_data.skills is not None:
            update_dict['skills'] = update_data.skills
        if update_data.interests is not None:
            update_dict['interests'] = update_data.interests
        if update_data.experience is not None:
            update_dict['experience'] = update_data.experience
        if update_data.company is not None:
            update_dict['company'] = update_data.company
        if update_data.website is not None:
            update_dict['website'] = update_data.website
        if update_data.location is not None:
            update_dict['location'] = update_data.location
        if update_data.headline is not None:
            update_dict['headline'] = update_data.headline
        if update_data.bio is not None:
            update_dict['bio'] = update_data.bio
        if update_data.photo is not None:
            update_dict['photo'] = update_data.photo
        if update_data.languages is not None:
            update_dict['languages'] = update_data.languages
        
        if not update_dict:
            raise HTTPException(
                status_code=400,
                detail="No update data provided"
            )
        
        # Update in Firestore
        success = await firestore_client.update_user(user_id, update_dict)
        
        if not success:
            raise HTTPException(
                status_code=500,
                detail="Failed to update profile"
            )
        
        # Get updated user data
        updated_user = await firestore_client.get_user(user_id)
        
        logger.info(f"Profile updated for user {user_id}")
        
        return {
            "userId": user_id,
            "email": updated_user.get('email'),
            "name": updated_user.get('name') or updated_user.get('full_name'),
            "full_name": updated_user.get('full_name'),
            "skills": updated_user.get('skills', []),
            "interests": updated_user.get('interests', []),
            "experience": updated_user.get('experience'),
            "company": updated_user.get('company'),
            "website": updated_user.get('website'),
            "location": updated_user.get('location'),
            "headline": updated_user.get('headline'),
            "bio": updated_user.get('bio'),
            "photo": updated_user.get('photo'),
            "languages": updated_user.get('languages', []),
            "createdAt": str(updated_user.get('createdAt')) if updated_user.get('createdAt') else None,
            "lastLogin": str(updated_user.get('lastLogin')) if updated_user.get('lastLogin') else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating profile: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to update profile"
        )

@router.delete("/profile")
async def delete_account(current_user: dict = Depends(get_current_user)):
    """
    Delete user account
    
    - Soft delete (mark as inactive)
    - Firestore security rules should prevent data access
    """
    try:
        user_id = current_user.get('userId')
        
        # Mark user as inactive
        await firestore_client.update_user(user_id, {'is_active': False})
        
        logger.info(f"Account deleted for user {user_id}")
        
        return {
            "message": "Account deleted successfully"
        }
        
    except Exception as e:
        logger.error(f"Error deleting account: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to delete account"
        )
