"""
Firebase/Firestore client configuration for job aggregation platform.
Handles all Firestore operations including user data, jobs, and chat history.
"""
import os
import base64
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger(__name__)

class FirestoreClient:
    """Singleton Firestore client for the application"""
    
    _instance = None
    _db = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(FirestoreClient, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        """Initialize Firebase Admin SDK"""
        try:
            # Check if already initialized
            if not firebase_admin._apps:
                cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "./serviceAccount.json")

                # Allow inline secrets for hosted environments (Railway/Vercel)
                inline_json = os.getenv("FIREBASE_CREDENTIALS_JSON")
                inline_b64 = os.getenv("FIREBASE_CREDENTIALS_BASE64")

                if inline_json:
                    cred_path = "./serviceAccount.runtime.json"
                    with open(cred_path, "w", encoding="utf-8") as f:
                        f.write(inline_json)
                    logger.info("Firebase credentials loaded from FIREBASE_CREDENTIALS_JSON")
                elif inline_b64:
                    cred_path = "./serviceAccount.runtime.json"
                    with open(cred_path, "wb") as f:
                        f.write(base64.b64decode(inline_b64))
                    logger.info("Firebase credentials loaded from FIREBASE_CREDENTIALS_BASE64")

                if os.path.exists(cred_path):
                    cred = credentials.Certificate(cred_path)
                    firebase_admin.initialize_app(cred)
                    logger.info("Firebase Admin SDK initialized successfully")
                else:
                    logger.warning(f"Firebase credentials not found at {cred_path}")
                    # Initialize with application default credentials (for Cloud Run/GCP)
                    firebase_admin.initialize_app()
            
            self._db = firestore.client()
            logger.info("Firestore client initialized")
            
        except Exception as e:
            logger.error(f"Failed to initialize Firestore: {e}")
            raise
    
    @property
    def db(self):
        """Get Firestore database instance"""
        if self._db is None:
            self._initialize()
        return self._db
    
    # ==================== USER OPERATIONS ====================
    
    async def create_user(self, user_id: str, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new user document"""
        try:
            user_ref = self.db.collection('users').document(user_id)
            user_data['createdAt'] = firestore.SERVER_TIMESTAMP
            user_data['lastLogin'] = firestore.SERVER_TIMESTAMP
            user_ref.set(user_data)
            logger.info(f"User created: {user_id}")
            return user_data
        except Exception as e:
            logger.error(f"Error creating user {user_id}: {e}")
            raise
    
    async def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        try:
            user_ref = self.db.collection('users').document(user_id)
            user_doc = user_ref.get()
            if user_doc.exists:
                user_data = user_doc.to_dict()
                user_data['userId'] = user_id
                return user_data
            return None
        except Exception as e:
            logger.error(f"Error getting user {user_id}: {e}")
            return None
    
    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email"""
        try:
            users_ref = self.db.collection('users')
            query = users_ref.where('email', '==', email).limit(1)
            docs = query.stream()
            
            for doc in docs:
                user_data = doc.to_dict()
                user_data['userId'] = doc.id
                return user_data
            return None
        except Exception as e:
            logger.error(f"Error getting user by email {email}: {e}")
            return None
    
    async def update_user(self, user_id: str, update_data: Dict[str, Any]) -> bool:
        """Update user profile"""
        try:
            user_ref = self.db.collection('users').document(user_id)
            user_ref.update(update_data)
            logger.info(f"User updated: {user_id}")
            return True
        except Exception as e:
            logger.error(f"Error updating user {user_id}: {e}")
            return False
    
    async def update_last_login(self, user_id: str):
        """Update user's last login timestamp"""
        try:
            user_ref = self.db.collection('users').document(user_id)
            user_ref.update({'lastLogin': firestore.SERVER_TIMESTAMP})
        except Exception as e:
            logger.error(f"Error updating last login for {user_id}: {e}")
    
    # ==================== PERSONALIZED JOBS OPERATIONS ====================
    
    async def add_personalized_job(self, user_id: str, job_data: Dict[str, Any]) -> str:
        """Add a personalized job for a specific user"""
        try:
            jobs_ref = self.db.collection('users').document(user_id).collection('personalizedJobs')
            job_data['scrapedAt'] = firestore.SERVER_TIMESTAMP
            job_data['isActive'] = True
            doc_ref = jobs_ref.add(job_data)
            job_id = doc_ref[1].id
            logger.info(f"Personalized job added for user {user_id}: {job_id}")
            return job_id
        except Exception as e:
            logger.error(f"Error adding personalized job for {user_id}: {e}")
            raise
    
    async def get_personalized_jobs(
        self, 
        user_id: str, 
        limit: int = 20, 
        offset: int = 0,
        active_only: bool = True
    ) -> List[Dict[str, Any]]:
        """Get personalized jobs for a user with pagination"""
        try:
            jobs_ref = self.db.collection('users').document(user_id).collection('personalizedJobs')
            
            # Simple query without compound index requirement
            docs = jobs_ref.stream()
            jobs = []
            
            for doc in docs:
                job_data = doc.to_dict()
                # Filter active jobs in code instead of query to avoid index requirement
                if active_only and not job_data.get('isActive', True):
                    continue
                    
                job_data['jobId'] = doc.id
                jobs.append(job_data)
            
            # Sort by scrapedAt in code
            jobs.sort(key=lambda x: x.get('scrapedAt', datetime.min), reverse=True)
            
            # Apply pagination
            start = offset
            end = offset + limit
            return jobs[start:end]
            
        except Exception as e:
            logger.error(f"Error getting personalized jobs for {user_id}: {e}")
            return []
    
    async def check_duplicate_job(self, user_id: str, job_title: str, company: str) -> bool:
        """Check if a job already exists for the user"""
        try:
            jobs_ref = self.db.collection('users').document(user_id).collection('personalizedJobs')
            query = jobs_ref.where('jobTitle', '==', job_title).where('company', '==', company).limit(1)
            docs = list(query.stream())
            return len(docs) > 0
        except Exception as e:
            logger.error(f"Error checking duplicate job: {e}")
            return False
    
    async def deactivate_old_jobs(self, days: int = 7):
        """Mark jobs older than specified days as inactive"""
        try:
            cutoff_date = datetime.now() - timedelta(days=days)
            
            # Get all users
            users_ref = self.db.collection('users')
            users = users_ref.stream()
            
            count = 0
            for user in users:
                jobs_ref = user.reference.collection('personalizedJobs')
                old_jobs = jobs_ref.where('scrapedAt', '<', cutoff_date).where('isActive', '==', True).stream()
                
                for job in old_jobs:
                    job.reference.update({'isActive': False})
                    count += 1
            
            logger.info(f"Deactivated {count} old personalized jobs")
            return count
        except Exception as e:
            logger.error(f"Error deactivating old jobs: {e}")
            return 0
    
    # ==================== GENERAL JOBS OPERATIONS ====================
    
    async def add_general_job(self, job_data: Dict[str, Any]) -> str:
        """Add a general gig job available to all users"""
        try:
            jobs_ref = self.db.collection('generalJobs')
            job_data['scrapedAt'] = firestore.SERVER_TIMESTAMP
            job_data['isActive'] = True
            doc_ref = jobs_ref.add(job_data)
            job_id = doc_ref[1].id
            logger.info(f"General job added: {job_id}")
            return job_id
        except Exception as e:
            logger.error(f"Error adding general job: {e}")
            raise
    
    async def get_general_jobs(
        self, 
        limit: int = 20, 
        offset: int = 0,
        category: Optional[str] = None,
        active_only: bool = True
    ) -> List[Dict[str, Any]]:
        """Get general gig jobs with pagination and filtering"""
        try:
            jobs_ref = self.db.collection('generalJobs')
            
            # Simple query without composite index requirement
            query = jobs_ref.limit(100)  # Get more docs to filter in memory
            
            docs = query.stream()
            jobs = []
            for doc in docs:
                job_data = doc.to_dict()
                job_data['jobId'] = doc.id
                
                # Filter in memory instead of query
                if active_only and not job_data.get('isActive', True):
                    continue
                if category and job_data.get('category') != category:
                    continue
                    
                jobs.append(job_data)
            
            # Sort in memory
            jobs.sort(key=lambda x: x.get('scrapedAt', 0), reverse=True)
            
            # Apply pagination in memory
            return jobs[offset:offset+limit]
        except Exception as e:
            logger.error(f"Error getting general jobs: {e}")
            return []
    
    async def check_duplicate_general_job(self, job_title: str, source_link: str) -> bool:
        """Check if a general job already exists"""
        try:
            jobs_ref = self.db.collection('generalJobs')
            query = jobs_ref.where('sourceLink', '==', source_link).limit(1)
            docs = list(query.stream())
            return len(docs) > 0
        except Exception as e:
            logger.error(f"Error checking duplicate general job: {e}")
            return False
    
    async def deactivate_old_general_jobs(self, days: int = 7):
        """Mark general jobs older than specified days as inactive"""
        try:
            cutoff_date = datetime.now() - timedelta(days=days)
            jobs_ref = self.db.collection('generalJobs')
            old_jobs = jobs_ref.where('scrapedAt', '<', cutoff_date).where('isActive', '==', True).stream()
            
            count = 0
            for job in old_jobs:
                job.reference.update({'isActive': False})
                count += 1
            
            logger.info(f"Deactivated {count} old general jobs")
            return count
        except Exception as e:
            logger.error(f"Error deactivating old general jobs: {e}")
            return 0
    
    # ==================== CHAT HISTORY OPERATIONS ====================
    
    async def add_chat_message(self, user_id: str, message_data: Dict[str, Any]):
        """Add a chat message to user's history"""
        try:
            chat_ref = self.db.collection('users').document(user_id).collection('chatHistory')
            message_data['timestamp'] = firestore.SERVER_TIMESTAMP
            chat_ref.add(message_data)
        except Exception as e:
            logger.error(f"Error adding chat message for {user_id}: {e}")
    
    async def get_chat_history(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get recent chat history for a user"""
        try:
            chat_ref = self.db.collection('users').document(user_id).collection('chatHistory')
            query = chat_ref.order_by('timestamp', direction=firestore.Query.DESCENDING).limit(limit)
            docs = query.stream()
            
            messages = []
            for doc in docs:
                msg_data = doc.to_dict()
                messages.append(msg_data)
            
            return list(reversed(messages))  # Return in chronological order
        except Exception as e:
            logger.error(f"Error getting chat history for {user_id}: {e}")
            return []
    
    # ==================== TOKEN OPERATIONS ====================
    
    async def store_refresh_token(self, user_id: str, token: str, expires_at: datetime):
        """Store refresh token for a user"""
        try:
            token_ref = self.db.collection('users').document(user_id).collection('refreshTokens')
            token_ref.add({
                'token': token,
                'expiresAt': expires_at,
                'createdAt': firestore.SERVER_TIMESTAMP,
                'isValid': True
            })
        except Exception as e:
            logger.error(f"Error storing refresh token for {user_id}: {e}")
    
    async def validate_refresh_token(self, user_id: str, token: str) -> bool:
        """Check if refresh token is valid"""
        try:
            tokens_ref = self.db.collection('users').document(user_id).collection('refreshTokens')
            query = tokens_ref.where('token', '==', token).where('isValid', '==', True).limit(1)
            docs = list(query.stream())
            
            if not docs:
                return False
            
            token_data = docs[0].to_dict()
            expires_at = token_data.get('expiresAt')
            
            if expires_at and datetime.now() < expires_at:
                return True
            
            # Token expired, invalidate it
            docs[0].reference.update({'isValid': False})
            return False
        except Exception as e:
            logger.error(f"Error validating refresh token: {e}")
            return False
    
    async def invalidate_refresh_token(self, user_id: str, token: str):
        """Invalidate a specific refresh token"""
        try:
            tokens_ref = self.db.collection('users').document(user_id).collection('refreshTokens')
            query = tokens_ref.where('token', '==', token).limit(1)
            docs = list(query.stream())
            
            for doc in docs:
                doc.reference.update({'isValid': False})
        except Exception as e:
            logger.error(f"Error invalidating refresh token: {e}")
    
    async def get_refresh_token_owner(self, token: str) -> Optional[str]:
        """Find which user owns this refresh token"""
        try:
            # Query all users
            users_ref = self.db.collection('users')
            users = users_ref.stream()
            
            for user in users:
                user_id = user.id
                tokens_ref = user.reference.collection('refreshTokens')
                query = tokens_ref.where('token', '==', token).where('isValid', '==', True).limit(1)
                docs = list(query.stream())
                
                if docs:
                    token_data = docs[0].to_dict()
                    expires_at = token_data.get('expiresAt')
                    
                    # Check if expired
                    if expires_at and datetime.now() < expires_at:
                        return user_id
                    else:
                        # Token expired, invalidate it
                        docs[0].reference.update({'isValid': False})
            
            return None
        except Exception as e:
            logger.error(f"Error finding refresh token owner: {e}")
            return None
    
    # ==================== PROVIDER OPPORTUNITIES OPERATIONS ====================
    
    async def create_opportunity(self, opportunity_data: Dict[str, Any]) -> str:
        """Create a provider opportunity"""
        try:
            opps_ref = self.db.collection('opportunities')
            opportunity_data['createdAt'] = firestore.SERVER_TIMESTAMP
            opportunity_data['updatedAt'] = firestore.SERVER_TIMESTAMP
            doc_ref = opps_ref.add(opportunity_data)
            opportunity_id = doc_ref[1].id
            logger.info(f"Provider opportunity created: {opportunity_id}")
            return opportunity_id
        except Exception as e:
            logger.error(f"Error creating opportunity: {e}")
            raise
    
    async def get_opportunity_by_id(self, opportunity_id: str) -> Optional[Dict[str, Any]]:
        """Get a single opportunity by ID"""
        try:
            opp_ref = self.db.collection('opportunities').document(opportunity_id)
            opp_doc = opp_ref.get()
            if opp_doc.exists:
                data = opp_doc.to_dict()
                data['id'] = opp_doc.id
                return data
            return None
        except Exception as e:
            logger.error(f"Error getting opportunity {opportunity_id}: {e}")
            return None
    
    async def get_general_job_by_id(self, job_id: str) -> Optional[Dict[str, Any]]:
        """Get a single general job by ID"""
        try:
            job_ref = self.db.collection('generalJobs').document(job_id)
            job_doc = job_ref.get()
            if job_doc.exists:
                data = job_doc.to_dict()
                data['jobId'] = job_doc.id
                return data
            return None
        except Exception as e:
            logger.error(f"Error getting general job {job_id}: {e}")
            return None
    
    async def get_provider_opportunities(
        self, 
        provider_id: str, 
        limit: int = 100,
        active_only: bool = False
    ) -> List[Dict[str, Any]]:
        """Get all opportunities created by a specific provider"""
        try:
            opps_ref = self.db.collection('opportunities')
            query = opps_ref.where('providerId', '==', provider_id).order_by(
                'createdAt', direction=firestore.Query.DESCENDING
            )
            
            if active_only:
                query = query.where('isActive', '==', True)
            
            query = query.limit(limit)
            docs = query.stream()
            
            opportunities = []
            for doc in docs:
                opp_data = doc.to_dict()
                opp_data['id'] = doc.id
                opportunities.append(opp_data)
            
            return opportunities
        except Exception as e:
            logger.error(f"Error getting provider opportunities for {provider_id}: {e}")
            return []
    
    async def get_all_provider_opportunities(
        self, 
        limit: int = 100,
        active_only: bool = True
    ) -> List[Dict[str, Any]]:
        """Get all provider opportunities"""
        try:
            opps_ref = self.db.collection('opportunities')
            # Simple query without index requirement
            query = opps_ref.limit(100)
            docs = query.stream()
            
            opportunities = []
            for doc in docs:
                opp_data = doc.to_dict()
                opp_data['id'] = doc.id
                
                # Filter in memory
                if active_only and not opp_data.get('isActive', True):
                    continue
                    
                opportunities.append(opp_data)
            
            # Sort in memory
            opportunities.sort(key=lambda x: x.get('createdAt', 0), reverse=True)
            
            return opportunities[:limit]
        except Exception as e:
            logger.error(f"Error getting all provider opportunities: {e}")
            return []
    
    async def update_opportunity(self, opportunity_id: str, update_data: Dict[str, Any]) -> bool:
        """Update a provider opportunity"""
        try:
            opp_ref = self.db.collection('opportunities').document(opportunity_id)
            update_data['updatedAt'] = firestore.SERVER_TIMESTAMP
            opp_ref.update(update_data)
            logger.info(f"Opportunity updated: {opportunity_id}")
            return True
        except Exception as e:
            logger.error(f"Error updating opportunity {opportunity_id}: {e}")
            return False
    
    async def delete_opportunity(self, opportunity_id: str) -> bool:
        """Delete a provider opportunity"""
        try:
            opp_ref = self.db.collection('opportunities').document(opportunity_id)
            opp_ref.delete()
            logger.info(f"Opportunity deleted: {opportunity_id}")
            return True
        except Exception as e:
            logger.error(f"Error deleting opportunity {opportunity_id}: {e}")
            return False

# Global instance
firestore_client = FirestoreClient()
