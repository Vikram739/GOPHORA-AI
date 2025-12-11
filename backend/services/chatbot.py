"""
Enhanced Gophora AI Chatbot
Built with LangChain + Google Gemini API
Features: General Q&A, Job Recommendations, RAG with embeddings, Conversational Memory
"""
import os
import logging
from typing import List, Dict, Any, Optional
import google.generativeai as genai
from dotenv import load_dotenv

# LangChain imports
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.prompts import PromptTemplate, ChatPromptTemplate, MessagesPlaceholder

from backend.database.firestore_client import firestore_client
from backend.utils.embeddings import embeddings_handler

load_dotenv()
logger = logging.getLogger(__name__)

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_CHAT_MODEL", "gemini-1.5-flash-latest")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

class GophoraAI:
    """Enhanced AI chatbot with LangChain integration"""
    
    def __init__(self):
        """Initialize chatbot with LangChain components"""
        try:
            # Initialize Gemini LLM
            self.llm = ChatGoogleGenerativeAI(
                model=GEMINI_MODEL,
                google_api_key=GEMINI_API_KEY,
                temperature=0.7,
                convert_system_message_to_human=True
            )
            
            # Initialize embeddings
            self.embeddings = GoogleGenerativeAIEmbeddings(
                model="models/embedding-001",
                google_api_key=GEMINI_API_KEY
            )
            
            # Conversation history (simple dict-based storage per user)
            self.conversations = {}
            
            logger.info("GophoraAI chatbot initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing GophoraAI: {e}")
            raise
    
    def _get_conversation_history(self, user_id: str) -> List[Dict]:
        """Get conversation history for a user"""
        if user_id not in self.conversations:
            self.conversations[user_id] = []
        return self.conversations[user_id]
    
    def _add_to_history(self, user_id: str, role: str, content: str):
        """Add message to conversation history"""
        if user_id not in self.conversations:
            self.conversations[user_id] = []
        self.conversations[user_id].append({"role": role, "content": content})
    
    async def detect_intent(self, message: str) -> str:
        """
        Detect user intent: 'job_search' or 'general_qa'
        """
        try:
            message_lower = message.lower()
            
            # Simple keyword detection - faster and more reliable
            job_keywords = [
                'job', 'jobs', 'work', 'career', 'position', 'hiring', 'opportunity',
                'developer', 'engineer', 'designer', 'manager', 'analyst', 'intern',
                'remote', 'freelance', 'part-time', 'full-time', 'gig',
                'java', 'python', 'react', 'data', 'marketing', 'sales'
            ]
            
            # Check if any job keyword is in the message
            for keyword in job_keywords:
                if keyword in message_lower:
                    logger.info(f"Detected job_search intent for: {message}")
                    return 'job_search'
            
            # Default to general Q&A
            logger.info(f"Detected general_qa intent for: {message}")
            return 'general_qa'
            
        except Exception as e:
            logger.error(f"Error in intent detection: {e}")
            return 'general_qa'
    
    async def search_jobs_keyword(
        self,
        user_id: str,
        query: str,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Keyword-based job search (no embeddings needed)
        Searches through job titles, descriptions, and categories
        """
        try:
            query_lower = query.lower()
            
            # Get user's personalized jobs
            try:
                personalized_jobs = await firestore_client.get_personalized_jobs(
                    user_id, 
                    limit=50, 
                    active_only=True
                )
            except Exception:
                personalized_jobs = []
            
            # Get general jobs
            general_jobs = await firestore_client.get_general_jobs(
                limit=50,
                active_only=True
            )
            
            # Combine all jobs
            all_jobs = personalized_jobs + general_jobs
            
            # Filter jobs by keyword matching
            matching_jobs = []
            for job in all_jobs:
                job_text = f"{job.get('jobTitle', '')} {job.get('description', '')} {job.get('category', '')} {job.get('company', '')} {job.get('source', '')}".lower()
                
                # Check if query keywords appear in job text
                query_words = query_lower.split()
                matches = sum(1 for word in query_words if word in job_text)
                
                if matches > 0:
                    # Add relevance score based on number of matches
                    job['relevance_score'] = matches
                    matching_jobs.append(job)
            
            # Sort by relevance score
            matching_jobs.sort(key=lambda x: x.get('relevance_score', 0), reverse=True)
            
            # Return top results
            top_jobs = matching_jobs[:limit]
            
            logger.info(f"Keyword search returned {len(top_jobs)} jobs for query: {query}")
            return top_jobs
            
        except Exception as e:
            logger.error(f"Error in keyword job search: {e}")
            return []
    
    async def handle_job_search(self, user_id: str, message: str) -> Dict[str, Any]:
        """Handle job search queries - NO FLUFF, just return jobs"""
        try:
            # Use keyword search
            jobs = await self.search_jobs_keyword(user_id, message, limit=10)
            
            if not jobs:
                return {
                    'reply': "I couldn't find any jobs matching your request. Try different keywords!",
                    'opportunities': []
                }
            
            # Simple direct message - no explanations
            reply = f"Found {len(jobs)} jobs for you:"
            
            return {
                'reply': reply,
                'opportunities': jobs
            }
            
        except Exception as e:
            logger.error(f"Error handling job search: {e}")
            return {
                'reply': "Error searching jobs. Please try again!",
                'opportunities': []
            }
    
    async def handle_general_qa(self, user_id: str, message: str) -> Dict[str, Any]:
        """Handle general Q&A - answer ANY question like ChatGPT"""
        try:
            # Get conversation history
            history = self._get_conversation_history(user_id)
            
            # Simple direct prompt - let Gemini answer anything
            system_message = """
You are a helpful AI assistant. Answer ANY question the user asks - whether it's about:
- Geography, history, science, technology
- Programming, math, general knowledge  
- Or the Gophora job platform

Be direct, accurate, and concise. Don't limit yourself to just Gophora topics.
If asked about Gophora specifically, explain that it's an AI-powered job aggregation platform.

Answer naturally like ChatGPT or Gemini would.
"""
            
            # Build conversation context
            conversation_context = system_message + "\n\nConversation:\n"
            for msg in history[-5:]:  # Last 5 messages
                conversation_context += f"{msg['role']}: {msg['content']}\n"
            conversation_context += f"user: {message}\nassistant:"
            
            response_obj = await self.llm.ainvoke(conversation_context)
            response = response_obj.content if hasattr(response_obj, 'content') else str(response_obj)
            
            # Add to history
            self._add_to_history(user_id, 'user', message)
            self._add_to_history(user_id, 'assistant', response)
            
            # Save to Firestore
            await firestore_client.add_chat_message(user_id, {
                'role': 'user',
                'content': message
            })
            await firestore_client.add_chat_message(user_id, {
                'role': 'assistant',
                'content': response
            })
            
            return {
                'reply': response,
                'opportunities': None
            }
            
        except Exception as e:
            logger.error(f"Error in general Q&A: {e}")
            return {
                'reply': "I'm having trouble processing your question right now. Please try again!",
                'opportunities': None
            }
    
    async def chat(self, user_id: str, message: str) -> Dict[str, Any]:
        """
        Main chat method - routes to appropriate handler based on intent
        
        Returns:
            {
                'reply': str,
                'opportunities': List[Dict] or None
            }
        """
        try:
            # Detect intent
            intent = await self.detect_intent(message)
            
            # Route to appropriate handler
            if intent == 'job_search':
                return await self.handle_job_search(user_id, message)
            else:
                return await self.handle_general_qa(user_id, message)
                
        except Exception as e:
            logger.error(f"Error in chat processing: {e}")
            return {
                'reply': "I'm sorry, I encountered an error. Please try again!",
                'opportunities': None
            }
    
    def clear_user_memory(self, user_id: str):
        """Clear conversation memory for a user"""
        if user_id in self.memories:
            del self.memories[user_id]
            logger.info(f"Cleared memory for user {user_id}")

# Global instance
gophora_ai = GophoraAI()
