# Analysis routes for job scam detection API

from flask import Blueprint, request, jsonify
from models.ml_models import ml_models

# Create blueprint
analysis_bp = Blueprint('analysis', __name__, url_prefix='/api')

@analysis_bp.route('/analyze-job', methods=['POST'])
def analyze_job():
    """
    Main endpoint for analyzing job postings
    
    Request body:
    {
        "jobTitle": str,
        "companyName": str,
        "jobDescription": str,
        "requirements": str (optional),
        "salary": str (optional),
        "location": str (optional)
    }
    
    Response:
    {
        "predictions": [
            {
                "algorithm": str,
                "prediction": "genuine" | "scam",
                "confidence": float (0-100)
            }
        ],
        "overallRisk": "genuine" | "suspicious" | "scam",
        "riskScore": float (0-100)
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['jobTitle', 'companyName', 'jobDescription']
        if not all(field in data for field in required_fields):
            return jsonify({
                'error': f'Missing required fields. Required: {required_fields}'
            }), 400
        
        # Get predictions from ML models
        result = ml_models.predict(data)
        
        return jsonify(result), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analysis_bp.route('/models', methods=['GET'])
def get_models():
    """Get list of available ML models"""
    return jsonify({
        'models': [
            {'name': 'Logistic Regression', 'type': 'Baseline'},
            {'name': 'Naive Bayes', 'type': 'Text Analysis'},
            {'name': 'Random Forest', 'type': 'Ensemble'},
            {'name': 'Support Vector Machine', 'type': 'Powerful Classifier'},
            {'name': 'K-Nearest Neighbors', 'type': 'Instance-Based'}
        ]
    }), 200
