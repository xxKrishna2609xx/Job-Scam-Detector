# Analysis routes for job scam detection API

from flask import Blueprint, request, jsonify
from models.ml_models import ml_models

# Create blueprint
analysis_bp = Blueprint('analysis', __name__, url_prefix='/api')

@analysis_bp.route('/analyze-job', methods=['POST'])
def analyze_job():
    """
    Main endpoint for analyzing job postings
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
