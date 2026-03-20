# Flask Backend for Job Scam Detection
# This is where you'll set up your Flask application

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Create Flask app
app = Flask(__name__)
CORS(app)

# Configuration
app.config['DEBUG'] = os.getenv('DEBUG', 'True') == 'True'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max request size

# TODO: Import your routes here
# from routes.analysis import analysis_bp
# app.register_blueprint(analysis_bp)

# Basic health check endpoint
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'message': 'Flask backend is running'}), 200

# Endpoint for job analysis (TODO: Implement with your ML models)
@app.route('/api/analyze-job', methods=['POST'])
def analyze_job():
    """
    Analyze a job posting for potential scams
    
    Expected JSON body:
    {
        "jobTitle": str,
        "companyName": str,
        "jobDescription": str,
        "requirements": str,
        "salary": str,
        "location": str
    }
    
    Returns:
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
        
        # Validate input
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        required_fields = ['jobTitle', 'companyName', 'jobDescription']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # TODO: Implement your ML model prediction here
        # 1. Preprocess the input data
        # 2. Load your trained models
        # 3. Get predictions from all 5 algorithms
        # 4. Aggregate results
        
        # Placeholder response (replace with actual predictions)
        response = {
            'predictions': [
                {
                    'algorithm': 'Logistic Regression',
                    'prediction': 'genuine',
                    'confidence': 85
                },
                {
                    'algorithm': 'Naive Bayes',
                    'prediction': 'genuine',
                    'confidence': 78
                },
                {
                    'algorithm': 'Random Forest',
                    'prediction': 'genuine',
                    'confidence': 91
                },
                {
                    'algorithm': 'Support Vector Machine',
                    'prediction': 'genuine',
                    'confidence': 88
                },
                {
                    'algorithm': 'K-Nearest Neighbors',
                    'prediction': 'genuine',
                    'confidence': 82
                }
            ],
            'overallRisk': 'genuine',
            'riskScore': 85
        }
        
        return jsonify(response), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/models/info', methods=['GET'])
def models_info():
    """Get information about available ML models"""
    return jsonify({
        'models': [
            {
                'name': 'Logistic Regression',
                'type': 'Baseline Model',
                'accuracy': '82%'
            },
            {
                'name': 'Multinomial Naive Bayes',
                'type': 'Text Analysis',
                'accuracy': '79%'
            },
            {
                'name': 'Random Forest',
                'type': 'Ensemble Learning',
                'accuracy': '91%'
            },
            {
                'name': 'Support Vector Machine',
                'type': 'Powerful Classifier',
                'accuracy': '88%'
            },
            {
                'name': 'K-Nearest Neighbors',
                'type': 'Instance-Based',
                'accuracy': '85%'
            }
        ]
    }), 200

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=app.config['DEBUG'])
