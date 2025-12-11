"""
Chat Router
Gophora AI chatbot endpoints with LangChain integration
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import logging

from backend.services.chatbot import gophora_ai
from backend.routers.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["Chat"])

# ==================== PYDANTIC MODELS ====================

class ChatRequest(BaseModel):
    message: str

class OpportunityResponse(BaseModel):
    jobId: Optional[str] = None
    jobTitle: str
    company: Optional[str] = None
    location: Optional[str] = None
    description: str
    requirements: Optional[str] = ""
    salary: Optional[str] = ""
    sourceLink: str
    source: str
    category: Optional[str] = None
    estimatedPay: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    opportunities: Optional[List[Dict[str, Any]]] = None
    intent: Optional[str] = None

# ==================== ENDPOINTS ====================

@router.post("", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Chat with Gophora AI
    
    - General Q&A about the platform
    - Job search and recommendations
    - Conversational context with memory
    - RAG-powered semantic search
    
    Requires authentication
    """
    try:
        user_id = current_user.get('userId')
        
        # Process chat message
        response = await gophora_ai.chat(user_id, request.message)
        
        logger.info(f"Chat processed for user {user_id}")
        
        return {
            "reply": response['reply'],
            "opportunities": response.get('opportunities'),
            "intent": None  # Can be added if needed
        }
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        raise HTTPException(
            status_code=500,
            detail="Chat processing failed"
        )

@router.post("/clear-history")
async def clear_chat_history(current_user: dict = Depends(get_current_user)):
    """
    Clear conversation memory for the current user
    
    - Removes LangChain conversation buffer
    - Does NOT delete Firestore chat history (for analytics)
    """
    try:
        user_id = current_user.get('userId')
        
        # Clear in-memory conversation
        gophora_ai.clear_user_memory(user_id)
        
        logger.info(f"Chat history cleared for user {user_id}")
        
        return {
            "message": "Chat history cleared successfully"
        }
        
    except Exception as e:
        logger.error(f"Error clearing chat history: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to clear chat history"
        )

@router.get("/history")
async def get_chat_history(
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """
    Get chat history from Firestore
    
    - Returns recent chat messages
    - Limited to specified number of messages
    """
    try:
        from backend.database.firestore_client import firestore_client
        
        user_id = current_user.get('userId')
        
        history = await firestore_client.get_chat_history(user_id, limit=limit)
        
        return {
            "history": history,
            "count": len(history)
        }
        
    except Exception as e:
        logger.error(f"Error fetching chat history: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch chat history"
        )
