"""
OpenAI embeddings utility for semantic search and RAG
Handles vectorization of job descriptions for similarity matching
"""
import os
from typing import List
import openai
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger(__name__)

openai.api_key = os.getenv("OPENAI_API_KEY")

class EmbeddingsHandler:
    """Handle OpenAI embeddings for semantic search"""
    
    @staticmethod
    async def generate_embedding(text: str, model: str = "text-embedding-ada-002") -> List[float]:
        """Generate embedding vector for text"""
        try:
            response = openai.Embedding.create(
                input=text,
                model=model
            )
            embedding = response['data'][0]['embedding']
            return embedding
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            return []
    
    @staticmethod
    async def generate_embeddings_batch(texts: List[str], model: str = "text-embedding-ada-002") -> List[List[float]]:
        """Generate embeddings for multiple texts"""
        try:
            response = openai.Embedding.create(
                input=texts,
                model=model
            )
            embeddings = [item['embedding'] for item in response['data']]
            return embeddings
        except Exception as e:
            logger.error(f"Error generating batch embeddings: {e}")
            return []
    
    @staticmethod
    def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity between two vectors"""
        import numpy as np
        
        vec1 = np.array(vec1)
        vec2 = np.array(vec2)
        
        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return dot_product / (norm1 * norm2)
    
    @staticmethod
    async def find_similar_jobs(query_text: str, job_embeddings: List[tuple]) -> List[tuple]:
        """
        Find jobs similar to query
        
        Args:
            query_text: User's search query
            job_embeddings: List of (job_data, embedding_vector) tuples
        
        Returns:
            Sorted list of (job_data, similarity_score) tuples
        """
        query_embedding = await EmbeddingsHandler.generate_embedding(query_text)
        
        if not query_embedding:
            return []
        
        results = []
        for job_data, job_embedding in job_embeddings:
            if job_embedding:
                similarity = EmbeddingsHandler.cosine_similarity(query_embedding, job_embedding)
                results.append((job_data, similarity))
        
        # Sort by similarity (highest first)
        results.sort(key=lambda x: x[1], reverse=True)
        return results

# Global instance
embeddings_handler = EmbeddingsHandler()
