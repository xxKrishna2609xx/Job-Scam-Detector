"""
Explanation Agent — uses Gemini 2.5 Flash to generate human-readable
analysis of the ML predictions.

Produces:
- Natural language explanation of why the job is genuine/scam
- Red flags (suspicious indicators)
- Trust signals (positive indicators)
"""

import os
import json
from typing import Dict
from agents.state import AgentState

import google.generativeai as genai


def get_gemini_model():
    """Get configured Gemini model instance."""
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not set in environment variables")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel("gemini-2.5-flash")


EXPLANATION_PROMPT = """You are an AI analyst for a Job Scam Detection system. You have access to the results of 5 machine learning models that analyzed a job posting.

**Job Posting Details:**
- Title: {job_title}
- Company: {company_name}
- Description: {job_description}
- Requirements: {requirements}
- Salary: {salary}
- Location: {location}

**ML Model Predictions:**
{predictions_text}

**Overall Assessment:** {overall_risk} (Legitimacy Score: {risk_score}%)

**Your Task:**
Analyze the job posting and the ML model predictions. Provide:
1. A clear, concise explanation (2-3 sentences) of why this job appears to be {overall_risk}
2. Specific red flags (suspicious indicators) found in the posting — if any
3. Trust signals (positive indicators) found in the posting — if any

**Respond with ONLY valid JSON (no markdown, no code fences) in this exact format:**
{{
  "explanation": "Your 2-3 sentence analysis here.",
  "red_flags": ["flag1", "flag2"],
  "trust_signals": ["signal1", "signal2"]
}}

If the job appears genuine with high confidence, red_flags can be an empty list.
If the job appears to be a scam, trust_signals can be an empty list.
Be specific and reference actual content from the job posting."""


def explanation_agent(state: AgentState) -> Dict:
    """
    LangGraph node: Generate AI-powered explanation of ML predictions.

    Uses Gemini to create human-readable analysis with red flags and trust signals.
    """
    job_data = state["job_data"]
    predictions = state.get("predictions", [])
    overall_risk = state.get("overall_risk", "genuine")
    risk_score = state.get("risk_score", 50.0)

    try:
        model = get_gemini_model()

        # Format predictions for the prompt
        pred_lines = []
        for p in predictions:
            pred_lines.append(
                f"  - {p['algorithm']}: {p['prediction'].upper()} "
                f"(Confidence: {p['confidence']}%)"
            )
        predictions_text = "\n".join(pred_lines) if pred_lines else "No predictions available"

        prompt = EXPLANATION_PROMPT.format(
            job_title=job_data.get("jobTitle", "N/A"),
            company_name=job_data.get("companyName", "N/A"),
            job_description=job_data.get("jobDescription", "N/A"),
            requirements=job_data.get("requirements", "N/A"),
            salary=job_data.get("salary", "N/A"),
            location=job_data.get("location", "N/A"),
            predictions_text=predictions_text,
            overall_risk=overall_risk,
            risk_score=risk_score,
        )

        # Call Gemini
        response = model.generate_content(prompt)
        response_text = response.text.strip()

        # Clean response (remove markdown code fences if present)
        if response_text.startswith("```"):
            lines = response_text.split("\n")
            lines = [l for l in lines if not l.startswith("```")]
            response_text = "\n".join(lines)

        result = json.loads(response_text)

        return {
            "ai_explanation": result.get("explanation", ""),
            "red_flags": result.get("red_flags", []),
            "trust_signals": result.get("trust_signals", []),
        }

    except json.JSONDecodeError as e:
        print(f"[EXPLANATION AGENT] JSON parse error: {e}")
        return {
            "ai_explanation": "AI analysis could not be generated at this time.",
            "red_flags": [],
            "trust_signals": [],
        }

    except Exception as e:
        print(f"[EXPLANATION AGENT] Error: {e}")
        return {
            "ai_explanation": f"AI analysis unavailable: {str(e)}",
            "red_flags": [],
            "trust_signals": [],
        }
