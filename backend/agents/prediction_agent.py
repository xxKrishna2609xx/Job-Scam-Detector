"""
Prediction Agent — wraps the existing 5 ML models.

Runs validated job data through all trained models:
- Logistic Regression
- Naive Bayes
- Random Forest
- SVM
- KNN
"""

from typing import Dict
from agents.state import AgentState
from models.ml_models import ml_models


def prediction_agent(state: AgentState) -> Dict:
    """
    LangGraph node: Run ML model predictions on validated input.

    Only runs if validation passed (is_valid == True).
    Returns updated state with predictions, overall_risk, risk_score.
    """
    job_data = state["job_data"]

    try:
        # Use the existing ML models predict method
        result = ml_models.predict(job_data)

        return {
            "predictions": result.get("predictions", []),
            "overall_risk": result.get("overallRisk", "genuine"),
            "risk_score": result.get("riskScore", 50.0),
        }

    except Exception as e:
        print(f"[PREDICTION AGENT] Error: {e}")
        return {
            "predictions": [],
            "overall_risk": "genuine",
            "risk_score": 50.0,
            "error": f"Prediction error: {str(e)}",
        }
