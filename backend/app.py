# Flask Backend for Job Scam Detection

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Create Flask app
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Configuration
app.config['DEBUG'] = os.getenv('DEBUG', 'False') == 'True'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max request size

# Register blueprints
from routes.analysis import analysis_bp
app.register_blueprint(analysis_bp)

@app.route('/', methods=['GET'])
def index():
    return jsonify({'status': 'online', 'service': 'Job Scam Detector API'}), 200


# Basic health check endpoint
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'message': 'Flask backend is running'}), 200


@app.route('/api/models/info', methods=['GET'])
def models_info():
    """Get information about available ML models."""
    from models.ml_models import ml_models

    models_list = []
    types_map = {
        'Logistic Regression': 'Baseline Model',
        'Naive Bayes': 'Text Analysis',
        'Random Forest': 'Ensemble Learning',
        'SVM': 'Powerful Classifier',
        'KNN': 'Instance-Based'
    }
    
    for name, meta in ml_models.metadata.items():
        models_list.append({
            'name': name,
            'type': types_map.get(name, 'Machine Learning Model'),
            'accuracy': meta.get('accuracy', 'N/A')
        })

    return jsonify({
        'models': models_list,
        'loaded': ml_models.is_loaded()
    }), 200


@app.route('/api/models/metrics', methods=['GET'])
def models_metrics():
    """Get full metrics (accuracy, precision, recall, f1, cm) for all models."""
    from models.ml_models import ml_models
    return jsonify(ml_models.metadata), 200


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
