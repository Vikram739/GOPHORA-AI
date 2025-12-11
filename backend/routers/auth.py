"""
Authentication Router
Implements JWT-based authentication with refresh tokens
"""
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from typing import Optional
import logging

from backend.database.firestore_client import firestore_client
from backend.utils.jwt_handler import jwt_handler

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# ==================== PYDANTIC MODELS ====================

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    skills: Optional[list[str]] = []
    interests: Optional[list[str]] = []
    experience: Optional[str] = "Entry Level"

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: str
    email: str

class RefreshRequest(BaseModel):
    refresh_token: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"

# ==================== DEPENDENCY ====================

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Dependency to validate JWT and get current user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Decode token
    payload = jwt_handler.decode_token(token)
    if not payload:
        raise credentials_exception
    
    user_id = payload.get("sub")
    if not user_id:
        raise credentials_exception
    
    # Get user from Firestore
    user = await firestore_client.get_user(user_id)
    if not user:
        raise credentials_exception
    
    return user

# ==================== ENDPOINTS ====================

@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register(user_data: RegisterRequest):
    """
    Register a new user
    
    - Creates user account with hashed password
    - Stores user profile in Firestore
    - Returns user ID
    """
    try:
        # Check if user already exists
        existing_user = await firestore_client.get_user_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash password
        hashed_password = jwt_handler.hash_password(user_data.password)
        
        # Create user document
        user_doc = {
            'email': user_data.email,
            'password_hash': hashed_password,
            'full_name': user_data.full_name,
            'skills': user_data.skills,
            'interests': user_data.interests,
            'experience': user_data.experience
        }
        
        # Generate user ID
        from uuid import uuid4
        user_id = str(uuid4())
        
        # Store in Firestore
        await firestore_client.create_user(user_id, user_doc)
        
        logger.info(f"New user registered: {user_id}")
        
        return {
            "message": "User registered successfully",
            "user_id": user_id,
            "email": user_data.email
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@router.post("/login", response_model=LoginResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Login with email and password
    
    - Validates credentials
    - Returns access token (7 days) and refresh token (30 days)
    - Updates last login timestamp
    """
    try:
        # Get user by email
        user = await firestore_client.get_user_by_email(form_data.username)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Verify password
        if not jwt_handler.verify_password(form_data.password, user['password_hash']):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        user_id = user['userId']
        email = user['email']
        
        # Create access token
        access_token = jwt_handler.create_access_token(user_id, email)
        
        # Create refresh token
        refresh_token, expires_at = jwt_handler.create_refresh_token(user_id)
        
        # Store refresh token in Firestore
        await firestore_client.store_refresh_token(user_id, refresh_token, expires_at)
        
        # Update last login
        await firestore_client.update_last_login(user_id)
        
        logger.info(f"User logged in: {user_id}")
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user_id": user_id,
            "email": email
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshRequest):
    """
    Refresh expired access token using refresh token
    
    - Validates refresh token
    - Returns new access token and optionally new refresh token
    """
    try:
        refresh_token = request.refresh_token
        
        # Find which user owns this refresh token
        user_id = await firestore_client.get_refresh_token_owner(refresh_token)
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token invalid or expired. Please login again.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Get user data
        user = await firestore_client.get_user(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        email = user.get('email')
        
        # Create new access token
        new_access_token = jwt_handler.create_access_token(user_id, email)
        
        # Optionally create new refresh token (token rotation for security)
        new_refresh_token, expires_at = jwt_handler.create_refresh_token(user_id)
        
        # Invalidate old refresh token
        await firestore_client.invalidate_refresh_token(user_id, refresh_token)
        
        # Store new refresh token
        await firestore_client.store_refresh_token(user_id, new_refresh_token, expires_at)
        
        logger.info(f"Token refreshed for user: {user_id}")
        
        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed"
        )

@router.get("/me", response_model=dict)
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    """
    Get current authenticated user's profile
    
    - Requires valid JWT token
    - Returns user profile data
    """
    return {
        "user_id": current_user.get('userId'),
        "email": current_user.get('email'),
        "full_name": current_user.get('full_name'),
        "skills": current_user.get('skills', []),
        "interests": current_user.get('interests', []),
        "experience": current_user.get('experience'),
        "created_at": current_user.get('createdAt'),
        "last_login": current_user.get('lastLogin')
    }

@router.post("/logout")
async def logout(
    refresh_token: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Logout user by invalidating refresh token
    """
    try:
        user_id = current_user.get('userId')
        await firestore_client.invalidate_refresh_token(user_id, refresh_token)
        
        logger.info(f"User logged out: {user_id}")
        
        return {"message": "Logged out successfully"}
        
    except Exception as e:
        logger.error(f"Logout error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed"
        )
