# Flask Backend for Job Scam Detection

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Create Flask app
app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:8080",
    "http://localhost:5173",
    "http://localhost:3000",
])

# Configuration
app.config['DEBUG'] = os.getenv('DEBUG', 'False') == 'True'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max request size

# Register blueprints
from routes.analysis import analysis_bp
app.register_blueprint(analysis_bp)


# Basic health check endpoint
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'message': 'Flask backend is running'}), 200


@app.route('/api/models/info', methods=['GET'])
def models_info():
    """Get information about available ML models."""
    from models.ml_models import ml_models

    return jsonify({
        'models': [
            {
                'name': 'Logistic Regression',
                'type': 'Baseline Model',
                'accuracy': ml_models.metadata.get('logistic_regression', 'N/A')
            },
            {
                'name': 'Multinomial Naive Bayes',
                'type': 'Text Analysis',
                'accuracy': ml_models.metadata.get('naive_bayes', 'N/A')
            },
            {
                'name': 'Random Forest',
                'type': 'Ensemble Learning',
                'accuracy': ml_models.metadata.get('random_forest', 'N/A')
            },
            {
                'name': 'Support Vector Machine',
                'type': 'Powerful Classifier',
                'accuracy': ml_models.metadata.get('svm', 'N/A')
            },
            {
                'name': 'K-Nearest Neighbors',
                'type': 'Instance-Based',
                'accuracy': ml_models.metadata.get('knn', 'N/A')
            }
        ],
        'loaded': ml_models.is_loaded()
    }), 200


@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'An internal server error occurred'}), 500


if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5000))
    debug = os.getenv('DEBUG', 'False') == 'True'
    app.run(host='0.0.0.0', port=port, debug=debug)
