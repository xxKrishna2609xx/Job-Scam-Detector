"""
Validation Agent — uses Gemini 2.5 Flash to validate user inputs.

Checks for:
- Gibberish / random characters in text fields
- Numeric text where text is expected (and vice versa)
- Implausible company names or job titles
- Proper salary format
- Valid location names
"""

import os
import json
from typing import Dict
from agents.state import AgentState

# Use Google Generative AI directly for reliability
import google.generativeai as genai


def get_gemini_model():
    """Get configured Gemini model instance."""
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not set in environment variables")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel("gemini-2.5-flash")


VALIDATION_PROMPT = """You are an input validation agent for a Job Scam Detection system.

Analyze each field of the job posting input below and determine if it contains valid, meaningful content.

**Rules:**
- "jobTitle": Must be a plausible job title (e.g. "Software Engineer", "Data Analyst"). Reject random characters like "dfghj", "asdf123", "xxxxxx".
- "companyName": Must be a plausible company or organization name. Reject gibberish like "fghfgh", "aaaa", "123456".
- "jobDescription": Must contain meaningful English text describing a job. Reject random characters, single words, or nonsensical text. Short but meaningful descriptions (2+ sentences) are acceptable.
- "requirements": If provided, must be meaningful text. Empty is OK.
- "salary": If provided, must look like a salary (e.g. "$50,000", "50k-80k", "100000", "$20/hr", "Competitive"). Reject pure text like "hello" or gibberish. Empty is OK.
- "location": If provided, must be a plausible location (city, country, "Remote", "Hybrid"). Reject gibberish. Empty is OK.

**Input to validate:**
{input_json}

**Respond with ONLY valid JSON (no markdown, no code fences) in this exact format:**
{{
  "is_valid": true/false,
  "fields": [
    {{"field": "jobTitle", "valid": true/false, "message": "explanation"}},
    {{"field": "companyName", "valid": true/false, "message": "explanation"}},
    {{"field": "jobDescription", "valid": true/false, "message": "explanation"}},
    {{"field": "requirements", "valid": true/false, "message": "explanation"}},
    {{"field": "salary", "valid": true/false, "message": "explanation"}},
    {{"field": "location", "valid": true/false, "message": "explanation"}}
  ],
  "summary": "Brief overall summary of validation"
}}

Set "is_valid" to false if ANY required field (jobTitle, companyName, jobDescription) is invalid. Optional fields (requirements, salary, location) being empty is fine."""


def validation_agent(state: AgentState) -> Dict:
    """
    LangGraph node: Validate user inputs using Gemini 2.5 Flash.

    Returns updated state with validation results.
    """
    job_data = state["job_data"]

    try:
        model = get_gemini_model()

        # Format the prompt
        input_json = json.dumps(job_data, indent=2)
        prompt = VALIDATION_PROMPT.format(input_json=input_json)

        # Call Gemini
        response = model.generate_content(prompt)
        response_text = response.text.strip()

        # Clean response (remove markdown code fences if present)
        if response_text.startswith("```"):
            lines = response_text.split("\n")
            lines = [l for l in lines if not l.startswith("```")]
            response_text = "\n".join(lines)

        # Parse JSON response
        validation = json.loads(response_text)

        return {
            "validation": validation,
            "is_valid": validation.get("is_valid", False),
        }

    except json.JSONDecodeError as e:
        print(f"[VALIDATION AGENT] JSON parse error: {e}")
        print(f"[VALIDATION AGENT] Raw response: {response_text}")
        # If Gemini response can't be parsed, let it through with a warning
        return {
            "validation": {
                "is_valid": True,
                "fields": [],
                "summary": "Validation agent could not parse response. Proceeding with analysis."
            },
            "is_valid": True,
        }

    except Exception as e:
        print(f"[VALIDATION AGENT] Error: {e}")
        # On any error, let the request through (don't block the user)
        return {
            "validation": {
                "is_valid": True,
                "fields": [],
                "summary": f"Validation skipped due to error: {str(e)}"
            },
            "is_valid": True,
        }
