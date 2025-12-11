"""
Personalized Job Scraper
Scrapes job opportunities from LinkedIn, Indeed, Glassdoor, and company career pages
Uses BeautifulSoup, Scrapy, and Selenium for comprehensive coverage
"""
import asyncio
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
import random
import time

# Web scraping imports
import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
from fake_useragent import UserAgent

# Internal imports
from backend.database.firestore_client import firestore_client
from backend.services.ai_validator import ai_validator

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PersonalizedJobScraper:
    """Scrapes personalized jobs for users based on their profiles"""
    
    def __init__(self):
        self.ua = UserAgent()
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': self.ua.random,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        })
    
    def _get_selenium_driver(self):
        """Initialize Selenium WebDriver with anti-detection settings"""
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument(f'user-agent={self.ua.random}')
        chrome_options.add_argument('--disable-blink-features=AutomationControlled')
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        
        # Remove webdriver property
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        
        return driver
    
    def _random_delay(self, min_seconds: float = 1.0, max_seconds: float = 3.0):
        """Add random delay to mimic human behavior"""
        time.sleep(random.uniform(min_seconds, max_seconds))
    
    async def scrape_indeed(self, keywords: str, location: str = "", limit: int = 10) -> List[Dict[str, Any]]:
        """Scrape jobs from Indeed"""
        jobs = []
        try:
            # Build Indeed search URL
            base_url = "https://www.indeed.com/jobs"
            params = {
                'q': keywords,
                'l': location,
                'limit': limit
            }
            
            response = self.session.get(base_url, params=params, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find job cards (Indeed's structure may change, adjust selectors as needed)
            job_cards = soup.find_all('div', class_='job_seen_beacon') or soup.find_all('td', class_='resultContent')
            
            for card in job_cards[:limit]:
                try:
                    # Extract job details
                    title_elem = card.find('h2', class_='jobTitle') or card.find('a', class_='jcs-JobTitle')
                    company_elem = card.find('span', class_='companyName')
                    location_elem = card.find('div', class_='companyLocation')
                    summary_elem = card.find('div', class_='job-snippet')
                    link_elem = title_elem.find('a') if title_elem else None
                    
                    if not title_elem:
                        continue
                    
                    job_title = title_elem.get_text(strip=True) if title_elem else "Unknown"
                    company = company_elem.get_text(strip=True) if company_elem else "Unknown"
                    job_location = location_elem.get_text(strip=True) if location_elem else location
                    description = summary_elem.get_text(strip=True) if summary_elem else ""
                    job_link = "https://www.indeed.com" + link_elem['href'] if link_elem and link_elem.get('href') else ""
                    
                    jobs.append({
                        'jobTitle': job_title,
                        'company': company,
                        'location': job_location,
                        'description': description,
                        'requirements': '',  # Indeed doesn't always show requirements in listings
                        'salary': '',
                        'sourceLink': job_link,
                        'source': 'Indeed'
                    })
                    
                except Exception as e:
                    logger.warning(f"Error parsing Indeed job card: {e}")
                    continue
            
            logger.info(f"Scraped {len(jobs)} jobs from Indeed")
            
        except Exception as e:
            logger.error(f"Error scraping Indeed: {e}")
        
        return jobs
    
    async def scrape_linkedin(self, keywords: str, location: str = "", limit: int = 100) -> List[Dict[str, Any]]:
        """
        Scrape jobs from LinkedIn using Selenium + BeautifulSoup
        Implements aggressive scrolling and pagination for 100+ jobs
        """
        jobs = []
        driver = None
        
        try:
            driver = self._get_selenium_driver()
            
            # Build LinkedIn jobs URL (public search, no login required)
            keywords_encoded = keywords.replace(' ', '%20')
            search_url = f"https://www.linkedin.com/jobs/search/?keywords={keywords_encoded}&location={location}&f_TPR=r86400&start=0"
            
            driver.get(search_url)
            self._random_delay(3, 5)
            
            # Aggressive scrolling to load MANY more jobs (scroll 20 times to load 100+ jobs)
            logger.info(f"LinkedIn: Aggressively scrolling to load {limit} jobs...")
            for scroll_num in range(20):
                # Scroll to bottom
                driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                self._random_delay(1, 2)
                
                # Try clicking "See more jobs" button if it appears
                try:
                    see_more_button = driver.find_element(By.XPATH, "//button[contains(text(), 'See more jobs')]")
                    see_more_button.click()
                    logger.info(f"LinkedIn: Clicked 'See more jobs' button (scroll {scroll_num + 1})")
                    self._random_delay(2, 3)
                except:
                    pass
                
                # Check current job count
                soup = BeautifulSoup(driver.page_source, 'html.parser')
                current_jobs = len(soup.find_all('div', class_='base-card'))
                logger.info(f"LinkedIn: Scroll {scroll_num + 1}/20, loaded {current_jobs} jobs so far")
                
                if current_jobs >= limit:
                    logger.info(f"LinkedIn: Reached target of {limit} jobs!")
                    break
            
            # Get final page source and parse with BeautifulSoup
            soup = BeautifulSoup(driver.page_source, 'html.parser')
            
            # Find ALL job cards (no limit here, we'll take first 'limit' later)
            job_cards = soup.find_all('div', class_='base-card')
            logger.info(f"LinkedIn: Found {len(job_cards)} total job cards, processing up to {limit}...")
            
            # Process up to 'limit' jobs
            for card in job_cards[:limit]:
                try:
                    # Extract job details
                    title_elem = card.find('h3', class_='base-search-card__title')
                    company_elem = card.find('h4', class_='base-search-card__subtitle')
                    location_elem = card.find('span', class_='job-search-card__location')
                    link_elem = card.find('a', class_='base-card__full-link')
                    
                    if not title_elem:
                        continue
                    
                    job_title = title_elem.get_text(strip=True)
                    company = company_elem.get_text(strip=True) if company_elem else "Unknown"
                    job_location = location_elem.get_text(strip=True) if location_elem else location
                    job_link = link_elem['href'] if link_elem and link_elem.get('href') else ""
                    
                    # Clean URL
                    if '?' in job_link:
                        job_link = job_link.split('?')[0]
                    
                    jobs.append({
                        'jobTitle': job_title,
                        'company': company,
                        'location': job_location,
                        'description': f"{job_title} position at {company}",
                        'requirements': '',
                        'salary': '',
                        'sourceLink': job_link,
                        'source': 'LinkedIn',
                        'category': 'Professional'
                    })
                    
                except Exception as e:
                    logger.warning(f"Error parsing LinkedIn job card: {e}")
                    continue
            
            logger.info(f"Scraped {len(jobs)} jobs from LinkedIn")
            
        except Exception as e:
            logger.error(f"Error scraping LinkedIn: {e}")
        finally:
            if driver:
                driver.quit()
        
        return jobs
    
    async def scrape_glassdoor(self, keywords: str, location: str = "", limit: int = 10) -> List[Dict[str, Any]]:
        """Scrape jobs from Glassdoor"""
        jobs = []
        driver = None
        
        try:
            driver = self._get_selenium_driver()
            
            # Build Glassdoor search URL
            keywords_encoded = keywords.replace(' ', '-')
            search_url = f"https://www.glassdoor.com/Job/jobs.htm?sc.keyword={keywords_encoded}"
            
            driver.get(search_url)
            self._random_delay(3, 5)
            
            # Parse with BeautifulSoup
            soup = BeautifulSoup(driver.page_source, 'html.parser')
            
            # Find job cards (Glassdoor uses different selectors)
            job_cards = soup.find_all('li', class_='react-job-listing')[:limit]
            
            for card in job_cards:
                try:
                    # Extract job details
                    title_elem = card.find('a', class_='jobLink')
                    company_elem = card.find('div', class_='employerName')
                    location_elem = card.find('div', class_='location')
                    
                    if not title_elem:
                        continue
                    
                    job_title = title_elem.get_text(strip=True)
                    company = company_elem.get_text(strip=True) if company_elem else "Unknown"
                    job_location = location_elem.get_text(strip=True) if location_elem else location
                    job_link = "https://www.glassdoor.com" + title_elem['href'] if title_elem.get('href') else ""
                    
                    jobs.append({
                        'jobTitle': job_title,
                        'company': company,
                        'location': job_location,
                        'description': f"{job_title} at {company}",
                        'requirements': '',
                        'salary': '',
                        'sourceLink': job_link,
                        'source': 'Glassdoor',
                        'category': 'Professional'
                    })
                    
                except Exception as e:
                    logger.warning(f"Error parsing Glassdoor job card: {e}")
                    continue
            
            logger.info(f"Scraped {len(jobs)} jobs from Glassdoor")
            
        except Exception as e:
            logger.error(f"Error scraping Glassdoor: {e}")
        finally:
            if driver:
                driver.quit()
        
        return jobs
    
    async def scrape_handshake(self, keywords: str, location: str = "", limit: int = 10) -> List[Dict[str, Any]]:
        """Scrape jobs from Handshake (student/entry-level focused)"""
        jobs = []
        driver = None
        
        try:
            driver = self._get_selenium_driver()
            
            # Handshake public job board
            keywords_encoded = keywords.replace(' ', '%20')
            search_url = f"https://joinhandshake.com/jobs?query={keywords_encoded}"
            
            driver.get(search_url)
            self._random_delay(3, 5)
            
            # Scroll to load jobs
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            self._random_delay(2, 3)
            
            # Parse with BeautifulSoup
            soup = BeautifulSoup(driver.page_source, 'html.parser')
            
            # Find job cards
            job_cards = soup.find_all('div', class_='job-card')[:limit]
            
            for card in job_cards:
                try:
                    title_elem = card.find('h3')
                    company_elem = card.find('p', class_='company-name')
                    location_elem = card.find('span', class_='location')
                    link_elem = card.find('a', href=True)
                    
                    if not title_elem:
                        continue
                    
                    job_title = title_elem.get_text(strip=True)
                    company = company_elem.get_text(strip=True) if company_elem else "Unknown"
                    job_location = location_elem.get_text(strip=True) if location_elem else location
                    job_link = "https://joinhandshake.com" + link_elem['href'] if link_elem else ""
                    
                    jobs.append({
                        'jobTitle': job_title,
                        'company': company,
                        'location': job_location,
                        'description': f"{job_title} - Entry level position",
                        'requirements': 'Entry level',
                        'salary': '',
                        'sourceLink': job_link,
                        'source': 'Handshake',
                        'category': 'Entry Level'
                    })
                    
                except Exception as e:
                    logger.warning(f"Error parsing Handshake job card: {e}")
                    continue
            
            logger.info(f"Scraped {len(jobs)} jobs from Handshake")
            
        except Exception as e:
            logger.error(f"Error scraping Handshake: {e}")
        finally:
            if driver:
                driver.quit()
        
        return jobs
    
    async def scrape_jobs_for_user(self, user_id: str) -> int:
        """
        Main method to scrape personalized jobs for a specific user
        Returns count of new jobs added
        """
        try:
            # Get user profile
            user_data = await firestore_client.get_user(user_id)
            
            if not user_data:
                logger.warning(f"User {user_id} not found")
                return 0
            
            skills = user_data.get('skills', [])
            interests = user_data.get('interests', [])
            experience = user_data.get('experience', '')
            
            if not skills and not interests:
                logger.warning(f"User {user_id} has no skills or interests defined")
                return 0
            
            # Build search keywords
            keywords = ', '.join(skills[:3]) if skills else ', '.join(interests[:3])
            location = user_data.get('location', '')
            
            # Scrape from multiple sources with HIGH LIMITS for 300+ jobs
            all_jobs = []
            
            # Indeed - high priority (100 jobs)
            indeed_jobs = await self.scrape_indeed(keywords, location, limit=100)
            all_jobs.extend(indeed_jobs)
            self._random_delay(2, 4)
            
            # LinkedIn (100 jobs)
            linkedin_jobs = await self.scrape_linkedin(keywords, location, limit=100)
            all_jobs.extend(linkedin_jobs)
            self._random_delay(2, 4)
            
            # Glassdoor (100 jobs)
            glassdoor_jobs = await self.scrape_glassdoor(keywords, location, limit=100)
            all_jobs.extend(glassdoor_jobs)
            self._random_delay(2, 4)
            
            # Handshake (for entry-level/students) (100 jobs)
            if experience in ['Entry Level', 'Student', 'Intern', '']:
                handshake_jobs = await self.scrape_handshake(keywords, location, limit=100)
                all_jobs.extend(handshake_jobs)
                self._random_delay(2, 4)
            
            # Validate and store jobs
            new_jobs_count = 0
            
            for job in all_jobs:
                # Check for duplicates
                is_duplicate = await firestore_client.check_duplicate_job(
                    user_id,
                    job['jobTitle'],
                    job['company']
                )
                
                if is_duplicate:
                    continue
                
                # Validate job relevance with AI
                validation = await ai_validator.validate_job_relevance(
                    user_skills=skills,
                    user_interests=interests,
                    user_experience=experience,
                    job_title=job['jobTitle'],
                    job_description=job['description'],
                    job_requirements=job.get('requirements', '')
                )
                
                # Only store relevant jobs (score >= 40) - lowered threshold for more jobs
                if validation['is_relevant']:
                    job['aiValidationScore'] = validation['relevance_score']
                    job['aiReasoning'] = validation['reasoning']
                    job['skillMatches'] = validation['skill_matches']
                    job['skillGaps'] = validation['skill_gaps']
                    
                    # Store in Firestore
                    await firestore_client.add_personalized_job(user_id, job)
                    new_jobs_count += 1
                    
                    logger.info(f"Added job for user {user_id}: {job['jobTitle']} (Score: {validation['relevance_score']})")
            
            logger.info(f"Scraping complete for user {user_id}. Added {new_jobs_count} new jobs")
            return new_jobs_count
            
        except Exception as e:
            logger.error(f"Error scraping jobs for user {user_id}: {e}")
            return 0
    
    async def scrape_jobs_for_all_users(self) -> Dict[str, int]:
        """
        Scrape personalized jobs for all active users
        Returns dictionary of {user_id: jobs_count}
        """
        try:
            # Get all users from Firestore
            users_ref = firestore_client.db.collection('users')
            users = users_ref.stream()
            
            results = {}
            
            for user_doc in users:
                user_id = user_doc.id
                count = await self.scrape_jobs_for_user(user_id)
                results[user_id] = count
                
                # Add delay between users to avoid rate limiting
                self._random_delay(5, 10)
            
            total_jobs = sum(results.values())
            logger.info(f"Scraping complete for all users. Total new jobs: {total_jobs}")
            
            return results
            
        except Exception as e:
            logger.error(f"Error in batch scraping: {e}")
            return {}

# Global instance
personalized_scraper = PersonalizedJobScraper()
