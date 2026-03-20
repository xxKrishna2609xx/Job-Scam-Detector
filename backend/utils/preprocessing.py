# Data preprocessing utilities for job scam detection

import re
import string
from typing import Dict, List

def clean_text(text: str) -> str:
    """
    Clean and normalize text data
    
    Args:
        text: Raw text to clean
    
    Returns:
        Cleaned text
    """
    # Convert to lowercase
    text = text.lower()
    
    # Remove URLs
    text = re.sub(r'http\S+|www\S+', '', text)
    
    # Remove special characters and digits
    text = re.sub(f'[{re.escape(string.punctuation)}]', ' ', text)
    text = re.sub(r'\d+', '', text)
    
    # Remove extra whitespace
    text = ' '.join(text.split())
    
    return text

def combine_job_features(job_data: Dict) -> str:
    """
    Combine all job features into a single text for analysis
    
    Args:
        job_data: Dictionary with job details
    
    Returns:
        Combined text string
    """
    features = [
        job_data.get('jobTitle', ''),
        job_data.get('companyName', ''),
        job_data.get('jobDescription', ''),
        job_data.get('requirements', ''),
        job_data.get('salary', ''),
        job_data.get('location', '')
    ]
    
    combined_text = ' '.join(str(f) for f in features if f)
    return combined_text

def extract_features(job_data: Dict) -> Dict:
    """
    Extract relevant features from job data
    
    Args:
        job_data: Raw job data
    
    Returns:
        Dictionary of extracted features
    """
    # TODO: Extract relevant features
    # Examples:
    # - Text features: job title, description, requirements
    # - Numerical features: salary range, location specificity
    # - Categorical features: company size, industry
    
    return {
        'combined_text': combine_job_features(job_data),
        'title_length': len(job_data.get('jobTitle', '')),
        'description_length': len(job_data.get('jobDescription', '')),
        # Add more features as needed
    }

def validate_job_data(job_data: Dict) -> bool:
    """
    Validate job data for analysis
    
    Args:
        job_data: Job data to validate
    
    Returns:
        True if valid, False otherwise
    """
    required_fields = ['jobTitle', 'companyName', 'jobDescription']
    
    for field in required_fields:
        if field not in job_data or not job_data[field]:
            return False
    
    return True
