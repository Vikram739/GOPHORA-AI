"""
JWT token handling utilities for authentication
Implements access and refresh token generation with bcrypt password hashing
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import os
import secrets
from jose import JWTError, jwt
import bcrypt
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger(__name__)

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_DAYS = 7
REFRESH_TOKEN_EXPIRE_DAYS = 30

class JWTHandler:
    """Handle JWT token operations"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password using bcrypt"""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        try:
            return bcrypt.checkpw(
                plain_password.encode('utf-8'),
                hashed_password.encode('utf-8')
            )
        except Exception as e:
            logger.error(f"Password verification error: {e}")
            return False
    
    @staticmethod
    def create_access_token(user_id: str, email: str, additional_claims: Optional[Dict] = None) -> str:
        """Create JWT access token"""
        expires_delta = timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
        expire = datetime.utcnow() + expires_delta
        
        to_encode = {
            "sub": user_id,
            "email": email,
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "access"
        }
        
        if additional_claims:
            to_encode.update(additional_claims)
        
        encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def create_refresh_token(user_id: str) -> tuple[str, datetime]:
        """Create refresh token and return token + expiry"""
        expires_delta = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        expire = datetime.utcnow() + expires_delta
        
        # Generate secure random token
        token = secrets.token_urlsafe(32)
        
        return token, expire
    
    @staticmethod
    def decode_token(token: str) -> Optional[Dict[str, Any]]:
        """Decode and validate JWT token"""
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            return payload
        except JWTError as e:
            logger.error(f"JWT decode error: {e}")
            return None
    
    @staticmethod
    def get_user_id_from_token(token: str) -> Optional[str]:
        """Extract user ID from token"""
        payload = JWTHandler.decode_token(token)
        if payload:
            return payload.get("sub")
        return None
    
    @staticmethod
    def is_token_expired(token: str) -> bool:
        """Check if token is expired"""
        payload = JWTHandler.decode_token(token)
        if not payload:
            return True
        
        exp = payload.get("exp")
        if not exp:
            return True
        
        return datetime.utcnow() > datetime.fromtimestamp(exp)

# Global instance
jwt_handler = JWTHandler()
