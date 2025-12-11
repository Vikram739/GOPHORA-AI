"""
AI Validator using Google Gemini API & OpenAI GPT-4
Validates job relevance against user profiles
Supports multiple AI providers for redundancy
"""
import os
import google.generativeai as genai
from openai import OpenAI
from typing import Dict, Any, List
from dotenv import load_dotenv
import logging
import json

load_dotenv()
logger = logging.getLogger(__name__)

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

GEMINI_MODEL = os.getenv("GEMINI_CHAT_MODEL", "gemini-1.5-flash-latest")

# Configure OpenAI API
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

class AIValidator:
    """AI-powered job validation using Gemini and OpenAI"""
    
    def __init__(self):
        self.use_openai = bool(openai_client)
        self.use_gemini = bool(GEMINI_API_KEY)
        logger.info(f"AI Validator initialized - OpenAI: {self.use_openai}, Gemini: {self.use_gemini}")
    
    async def _call_openai(self, prompt: str, response_format: str = "json") -> str:
        """Call OpenAI GPT-4 API"""
        try:
            if not openai_client:
                raise Exception("OpenAI not configured")
            
            response = openai_client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": "You are an expert career advisor and job matching AI. Always respond in valid JSON format."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=1000
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            raise
    
    async def _call_gemini(self, prompt: str) -> str:
        """Call Google Gemini API"""
        try:
            model = genai.GenerativeModel(GEMINI_MODEL)
            response = model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            raise
    
    async def validate_job_relevance(
        self,
        user_skills: List[str],
        user_interests: List[str],
        user_experience: str,
        job_title: str,
        job_description: str,
        job_requirements: str
    ) -> Dict[str, Any]:
        """
        Validate if a job matches user profile
        
        Returns:
            {
                'relevance_score': float (0-100),
                'reasoning': str,
                'is_relevant': bool,
                'skill_matches': List[str],
                'skill_gaps': List[str]
            }
        """
        try:
            # Construct validation prompt
            prompt = f"""
You are an expert career advisor and job matching AI. Analyze if this job is relevant for the candidate.

**Candidate Profile:**
- Skills: {', '.join(user_skills) if user_skills else 'Not specified'}
- Interests: {', '.join(user_interests) if user_interests else 'Not specified'}
- Experience Level: {user_experience if user_experience else 'Not specified'}

**Job Details:**
- Title: {job_title}
- Description: {job_description}
- Requirements: {job_requirements}

**Task:**
Provide a detailed analysis in JSON format with:
1. relevance_score (0-100): How well this job matches the candidate
2. reasoning: Brief explanation of the score
3. is_relevant: true if score >= 40, false otherwise
4. skill_matches: List of candidate skills that match job requirements
5. skill_gaps: List of required skills the candidate lacks

**Scoring Guidelines:**
- 90-100: Perfect match, candidate highly qualified
- 70-89: Good match, candidate qualified with minor gaps
- 50-69: Moderate match, candidate could apply
- 40-49: Acceptable match, candidate can learn on the job
- 0-39: Poor match, not recommended

Return ONLY valid JSON, no additional text.
"""
            
            # Try OpenAI first (GPT-4), fallback to Gemini
            response_text = ""
            try:
                if self.use_openai:
                    response_text = await self._call_openai(prompt)
                    logger.info("Used OpenAI GPT-4 for validation")
                elif self.use_gemini:
                    response_text = await self._call_gemini(prompt)
                    logger.info("Used Google Gemini for validation")
                else:
                    raise Exception("No AI provider configured")
            except Exception as e:
                # Fallback to alternative provider
                logger.warning(f"Primary AI failed: {e}, trying fallback...")
                if self.use_gemini and not response_text:
                    response_text = await self._call_gemini(prompt)
                    logger.info("Used Gemini as fallback")
                elif self.use_openai and not response_text:
                    response_text = await self._call_openai(prompt)
                    logger.info("Used OpenAI as fallback")
                else:
                    raise
            
            # Extract JSON from response (handles markdown code blocks)
            if "```json" in response_text:
                json_start = response_text.find("```json") + 7
                json_end = response_text.find("```", json_start)
                response_text = response_text[json_start:json_end].strip()
            elif "```" in response_text:
                json_start = response_text.find("```") + 3
                json_end = response_text.find("```", json_start)
                response_text = response_text[json_start:json_end].strip()
            
            validation_result = json.loads(response_text)
            
            # Ensure all required fields exist
            default_result = {
                'relevance_score': 0,
                'reasoning': 'Unable to analyze',
                'is_relevant': False,
                'skill_matches': [],
                'skill_gaps': []
            }
            
            return {**default_result, **validation_result}
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON parse error in AI validation: {e}\nResponse: {response_text}")
            return {
                'relevance_score': 0,
                'reasoning': 'Error parsing AI response',
                'is_relevant': False,
                'skill_matches': [],
                'skill_gaps': []
            }
        except Exception as e:
            logger.error(f"Error in AI job validation: {e}")
            return {
                'relevance_score': 0,
                'reasoning': f'Validation error: {str(e)}',
                'is_relevant': False,
                'skill_matches': [],
                'skill_gaps': []
            }
    
    async def quick_relevance_check(self, user_skills: List[str], job_description: str) -> float:
        """
        Quick relevance score without detailed analysis
        Returns score 0-100
        """
        try:
            prompt = f"""
Rate the relevance of this job for a candidate with these skills: {', '.join(user_skills)}

Job Description: {job_description[:500]}

Provide ONLY a number from 0-100 representing relevance percentage.
"""
            
            response_text = ""
            if self.use_openai:
                response_text = await self._call_openai(prompt)
            elif self.use_gemini:
                response_text = await self._call_gemini(prompt)
            
            # Extract number from response
            score_text = response_text.strip()
            score = float(''.join(filter(str.isdigit, score_text)))
            return min(100, max(0, score))
            
        except Exception as e:
            logger.error(f"Error in quick relevance check: {e}")
            return 0.0
    
    async def categorize_job(self, job_title: str, job_description: str) -> str:
        """
        Categorize job into predefined categories
        Returns category name
        """
        try:
            prompt = f"""
Categorize this job into ONE of these categories:
- Technology & IT
- Creative & Design
- Data Entry & Admin
- Customer Service
- Sales & Marketing
- Writing & Content
- Education & Training
- Healthcare
- Finance & Accounting
- Freelance & Gig
- Other

Job Title: {job_title}
Job Description: {job_description[:300]}

Return ONLY the category name, nothing else.
"""
            
            response_text = ""
            if self.use_openai:
                response_text = await self._call_openai(prompt)
            elif self.use_gemini:
                response_text = await self._call_gemini(prompt)
            
            category = response_text.strip()
            return category
            
        except Exception as e:
            logger.error(f"Error in job categorization: {e}")
            return "Other"

# Global instance
ai_validator = AIValidator()
