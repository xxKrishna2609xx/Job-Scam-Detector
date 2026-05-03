"""
LangGraph Pipeline — assembles the multi-agent workflow.

Graph Structure:
    START -> validation_agent -> (conditional) -> prediction_agent -> explanation_agent -> END
                                    |
                                    +-> END (if validation fails)
"""

from langgraph.graph import StateGraph, END
from agents.state import AgentState
from agents.validation_agent import validation_agent
from agents.prediction_agent import prediction_agent
from agents.explanation_agent import explanation_agent


def should_continue_after_validation(state: AgentState) -> str:
    """
    Conditional edge: decide whether to proceed to prediction or stop.

    If validation passed -> go to prediction
    If validation failed -> go straight to END
    """
    if state.get("is_valid", False):
        return "predict"
    else:
        return "end"


def build_graph():
    """
    Build and compile the LangGraph agent pipeline.

    Returns a compiled graph that can be invoked with:
        result = graph.invoke({"job_data": {...}, "is_valid": False, ...})
    """
    # Create the state graph
    workflow = StateGraph(AgentState)

    # Add nodes (agents)
    workflow.add_node("validate", validation_agent)
    workflow.add_node("predict", prediction_agent)
    workflow.add_node("explain", explanation_agent)

    # Set entry point
    workflow.set_entry_point("validate")

    # Add conditional edge after validation
    workflow.add_conditional_edges(
        "validate",
        should_continue_after_validation,
        {
            "predict": "predict",
            "end": END,
        }
    )

    # Linear edges: predict -> explain -> END
    workflow.add_edge("predict", "explain")
    workflow.add_edge("explain", END)

    # Compile the graph
    return workflow.compile()


# Global compiled graph instance
agent_graph = build_graph()


def run_analysis(job_data: dict) -> dict:
    """
    Execute the full agent pipeline on a job posting.

    Args:
        job_data: Dict with keys: jobTitle, companyName, jobDescription,
                  requirements, salary, location

    Returns:
        Complete analysis result including validation, predictions, and explanation.
    """
    # Initialize state
    initial_state = {
        "job_data": job_data,
        "is_valid": False,
        "validation": None,
        "predictions": None,
        "overall_risk": None,
        "risk_score": None,
        "ai_explanation": None,
        "red_flags": None,
        "trust_signals": None,
        "error": None,
    }

    # Run the graph
    final_state = agent_graph.invoke(initial_state)

    # Format the response for the API
    if not final_state.get("is_valid", False):
        # Validation failed — return validation errors
        return {
            "status": "validation_failed",
            "validation": final_state.get("validation", {}),
            "predictions": [],
            "overallRisk": None,
            "riskScore": None,
            "aiExplanation": None,
            "redFlags": [],
            "trustSignals": [],
            "mock": False,
        }

    # Full successful analysis
    return {
        "status": "success",
        "validation": final_state.get("validation", {}),
        "predictions": final_state.get("predictions", []),
        "overallRisk": final_state.get("overall_risk", "genuine"),
        "riskScore": final_state.get("risk_score", 50.0),
        "aiExplanation": final_state.get("ai_explanation", ""),
        "redFlags": final_state.get("red_flags", []),
        "trustSignals": final_state.get("trust_signals", []),
        "mock": False,
    }
