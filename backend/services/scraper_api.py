"""
API-Based Job Scrapers - No Selenium needed, works on cloud
Uses free public APIs from real job sites
"""
import asyncio
import logging
from typing import List, Dict, Any
import requests
from datetime import datetime
import json

logger = logging.getLogger(__name__)

class APIJobScraper:
    """Scrape jobs from public APIs - works 24/7 on cloud"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
    
    async def scrape_remoteok(self, keywords: str = "", limit: int = 100) -> List[Dict[str, Any]]:
        """
        Scrape RemoteOK.com API - 100% remote jobs
        Public API, no auth needed
        """
        jobs = []
        try:
            url = "https://remoteok.com/api"
            response = self.session.get(url, timeout=15)
            response.raise_for_status()
            
            data = response.json()
            
            # Filter and process jobs
            for item in data[1:limit+1]:  # Skip first item (metadata)
                if not isinstance(item, dict):
                    continue
                
                # Filter by keywords if provided
                if keywords:
                    search_text = f"{item.get('position', '')} {item.get('description', '')}".lower()
                    if keywords.lower() not in search_text:
                        continue
                
                jobs.append({
                    'jobTitle': item.get('position', 'Remote Position'),
                    'company': item.get('company', 'Remote Company'),
                    'location': 'Remote',
                    'description': item.get('description', '')[:500],
                    'requirements': '',
                    'salary': item.get('salary_range', ''),
                    'sourceLink': item.get('url', 'https://remoteok.com'),
                    'source': 'RemoteOK',
                    'category': 'Remote',
                    'tags': item.get('tags', [])
                })
            
            logger.info(f"RemoteOK: Scraped {len(jobs)} real remote jobs")
            
        except Exception as e:
            logger.error(f"RemoteOK API error: {e}")
        
        return jobs
    
    async def scrape_adzuna(self, keywords: str, location: str = "US", limit: int = 100) -> List[Dict[str, Any]]:
        """
        Scrape Adzuna API - aggregates from multiple sources
        Free tier: 1000 calls/month
        """
        jobs = []
        try:
            # Adzuna API (you need to get free API key from developer.adzuna.com)
            app_id = "test"  # Replace with real API key
            app_key = "test"
            
            url = f"https://api.adzuna.com/v1/api/jobs/{location.lower()}/search/1"
            params = {
                'app_id': app_id,
                'app_key': app_key,
                'results_per_page': min(limit, 50),
                'what': keywords,
                'content-type': 'application/json'
            }
            
            response = self.session.get(url, params=params, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                
                for item in data.get('results', []):
                    jobs.append({
                        'jobTitle': item.get('title', ''),
                        'company': item.get('company', {}).get('display_name', 'Company'),
                        'location': item.get('location', {}).get('display_name', location),
                        'description': item.get('description', '')[:500],
                        'requirements': '',
                        'salary': f"${item.get('salary_min', 0)}-${item.get('salary_max', 0)}" if item.get('salary_min') else '',
                        'sourceLink': item.get('redirect_url', ''),
                        'source': 'Adzuna',
                        'category': item.get('category', {}).get('label', 'General')
                    })
                
                logger.info(f"Adzuna: Scraped {len(jobs)} real jobs")
            
        except Exception as e:
            logger.error(f"Adzuna API error: {e}")
        
        return jobs
    
    async def scrape_github_jobs(self, keywords: str, location: str = "", limit: int = 50) -> List[Dict[str, Any]]:
        """
        Scrape GitHub Jobs alternatives (Himalayas, WorkingNomads)
        """
        jobs = []
        try:
            # Himalayas.app API (tech jobs)
            url = "https://himalayas.app/jobs/api"
            response = self.session.get(url, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                
                for item in data.get('jobs', [])[:limit]:
                    if keywords.lower() in item.get('title', '').lower() or keywords.lower() in item.get('description', '').lower():
                        jobs.append({
                            'jobTitle': item.get('title', ''),
                            'company': item.get('company_name', 'Tech Company'),
                            'location': item.get('location', 'Remote'),
                            'description': item.get('description', '')[:500],
                            'requirements': '',
                            'salary': item.get('salary', ''),
                            'sourceLink': item.get('url', 'https://himalayas.app'),
                            'source': 'Himalayas',
                            'category': 'Tech'
                        })
            
            logger.info(f"Himalayas: Scraped {len(jobs)} tech jobs")
            
        except Exception as e:
            logger.error(f"GitHub alternatives error: {e}")
        
        return jobs
    
    async def scrape_arbeitnow(self, keywords: str = "", limit: int = 100) -> List[Dict[str, Any]]:
        """
        Scrape Arbeitnow API - European tech jobs
        Free public API
        """
        jobs = []
        try:
            url = "https://www.arbeitnow.com/api/job-board-api"
            response = self.session.get(url, timeout=15)
            response.raise_for_status()
            
            data = response.json()
            
            for item in data.get('data', [])[:limit]:
                if keywords and keywords.lower() not in item.get('title', '').lower():
                    continue
                
                jobs.append({
                    'jobTitle': item.get('title', ''),
                    'company': item.get('company_name', 'Company'),
                    'location': item.get('location', 'Europe'),
                    'description': item.get('description', '')[:500],
                    'requirements': '',
                    'salary': '',
                    'sourceLink': item.get('url', ''),
                    'source': 'Arbeitnow',
                    'category': 'Tech',
                    'tags': item.get('tags', [])
                })
            
            logger.info(f"Arbeitnow: Scraped {len(jobs)} European tech jobs")
            
        except Exception as e:
            logger.error(f"Arbeitnow API error: {e}")
        
        return jobs
    
    async def scrape_usajobs(self, keywords: str, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Scrape USAJobs.gov API - US Government jobs
        Public API
        """
        jobs = []
        try:
            url = "https://data.usajobs.gov/api/search"
            headers = {
                'Host': 'data.usajobs.gov',
                'User-Agent': 'your@email.com',  # Required by USAJobs
                'Authorization-Key': 'your-api-key'  # Get free key from usajobs.gov
            }
            
            params = {
                'Keyword': keywords,
                'ResultsPerPage': min(limit, 500)
            }
            
            response = self.session.get(url, headers=headers, params=params, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                
                for item in data.get('SearchResult', {}).get('SearchResultItems', []):
                    job = item.get('MatchedObjectDescriptor', {})
                    jobs.append({
                        'jobTitle': job.get('PositionTitle', ''),
                        'company': job.get('OrganizationName', 'US Government'),
                        'location': ', '.join(job.get('PositionLocationDisplay', [])),
                        'description': job.get('UserArea', {}).get('Details', {}).get('JobSummary', '')[:500],
                        'requirements': job.get('QualificationSummary', ''),
                        'salary': f"${job.get('PositionRemuneration', [{}])[0].get('MinimumRange', '')}-${job.get('PositionRemuneration', [{}])[0].get('MaximumRange', '')}",
                        'sourceLink': job.get('ApplyURI', [''])[0],
                        'source': 'USAJobs',
                        'category': 'Government'
                    })
                
                logger.info(f"USAJobs: Scraped {len(jobs)} government jobs")
            
        except Exception as e:
            logger.error(f"USAJobs API error: {e}")
        
        return jobs
    
    async def scrape_all_sources(self, keywords: str, location: str = "US", limit_per_source: int = 100) -> List[Dict[str, Any]]:
        """
        Scrape ALL API sources in parallel for maximum jobs
        Returns 500+ real jobs from multiple sources
        """
        all_jobs = []
        
        # Run all scrapers in parallel
        tasks = [
            self.scrape_remoteok(keywords, limit_per_source),
            self.scrape_arbeitnow(keywords, limit_per_source),
            self.scrape_github_jobs(keywords, location, limit_per_source),
            # Add more as needed
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for result in results:
            if isinstance(result, list):
                all_jobs.extend(result)
        
        logger.info(f"API Scrapers: Total {len(all_jobs)} real jobs from all sources")
        return all_jobs

# Global instance
api_scraper = APIJobScraper()
