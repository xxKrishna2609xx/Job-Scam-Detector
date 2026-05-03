# Analysis routes for job scam detection API

from flask import Blueprint, request, jsonify
from models.ml_models import ml_models

# Create blueprint
analysis_bp = Blueprint('analysis', __name__, url_prefix='/api')

@analysis_bp.route('/analyze-job', methods=['POST'])
def analyze_job():
    """
    Main endpoint for analyzing job postings.

    Uses the LangGraph agent pipeline:
      1. Validation Agent (Gemini) — checks for gibberish/invalid inputs
      2. Prediction Agent (ML Models) — runs 5 trained classifiers
      3. Explanation Agent (Gemini) — generates AI-powered analysis
    """
    try:
        data = request.get_json()

        # Validate required fields exist in request
        required_fields = ['jobTitle', 'companyName', 'jobDescription']
        if not all(field in data for field in required_fields):
            return jsonify({
                'error': f'Missing required fields. Required: {required_fields}'
            }), 400

        # Run the LangGraph agent pipeline
        from agents.graph import run_analysis
        result = run_analysis(data)

        return jsonify(result), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@analysis_bp.route('/models', methods=['GET'])
def get_models():
    """Get list of available ML models"""
    models_list = []
    types_map = {
        'Logistic Regression': 'Baseline Model',
        'Naive Bayes': 'Text Analysis',
        'Random Forest': 'Ensemble Learning',
        'SVM': 'Powerful Classifier',
        'KNN': 'Instance-Based'
    }

    for name in ml_models.metadata.keys():
        models_list.append({
            'name': name,
            'type': types_map.get(name, 'Machine Learning Model')
        })

    return jsonify({
        'models': models_list
    }), 200
