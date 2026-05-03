"""
Shared state definition for the LangGraph agent pipeline.
All agents read from and write to this state.
"""

from typing import TypedDict, Dict, List, Optional


class FieldValidation(TypedDict):
    """Validation result for a single input field."""
    field: str
    valid: bool
    message: str


class ValidationResult(TypedDict):
    """Complete validation result from the Validation Agent."""
    is_valid: bool
    fields: List[FieldValidation]
    summary: str


class PredictionItem(TypedDict):
    """Single model prediction."""
    algorithm: str
    prediction: str  # "genuine" or "scam"
    confidence: float


class AgentState(TypedDict):
    """
    Shared state flowing through the LangGraph pipeline.

    Flow: User Input -> Validation -> Prediction -> Explanation -> Response
    """
    # --- Input ---
    job_data: Dict                          # Raw user input from the form

    # --- Validation Agent output ---
    validation: Optional[ValidationResult]  # Per-field validation from Gemini
    is_valid: bool                          # Gate: should we proceed to prediction?

    # --- Prediction Agent output ---
    predictions: Optional[List[PredictionItem]]
    overall_risk: Optional[str]             # "genuine", "suspicious", "scam"
    risk_score: Optional[float]

    # --- Explanation Agent output ---
    ai_explanation: Optional[str]           # Gemini-generated explanation
    red_flags: Optional[List[str]]          # Specific warning indicators
    trust_signals: Optional[List[str]]      # Positive indicators

    # --- Error tracking ---
    error: Optional[str]
