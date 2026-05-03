# ML Models module — loads trained models and runs predictions

import os
import pickle
from typing import Dict, List, Tuple, Optional


MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "trained")


class MLModels:
    """
    Manages loading and using ML models for job scam detection.
    Falls back to mock predictions if models aren't trained yet.
    """

    def __init__(self):
        self.models = {}
        self.preprocessor = None
        self.metadata: Dict = {}
        self._loaded = False
        self.load_models()

    def load_models(self):
        """Load the best trained ML model and preprocessor from disk."""
        try:
            # Load preprocessor
            preprocessor_path = os.path.join(MODEL_DIR, "preprocessor.pkl")
            if not os.path.exists(preprocessor_path):
                print("[WARN] Preprocessor not found. Run the training notebook first.")
                return

            with open(preprocessor_path, "rb") as f:
                self.preprocessor = pickle.load(f)

            # Load the models dictionary
            model_path = os.path.join(MODEL_DIR, "models_dict.pkl")
            if os.path.exists(model_path):
                with open(model_path, "rb") as f:
                    self.models = pickle.load(f)
                print("  [OK] Loaded models_dict.pkl")
            else:
                print(f"  [MISS] Missing {model_path}")

            # Load metadata
            metadata_path = os.path.join(MODEL_DIR, "metadata.pkl")
            if os.path.exists(metadata_path):
                with open(metadata_path, "rb") as f:
                    self.metadata = pickle.load(f)

            self._loaded = len(self.models) > 0 and self.preprocessor is not None
            if self._loaded:
                print("[OK] Loaded model successfully")
            else:
                print("[WARN] Model not loaded -- will use mock predictions")

        except Exception as e:
            print(f"[ERROR] Error loading models: {e}")
            self._loaded = False

    def is_loaded(self) -> bool:
        """Return whether real trained model is available."""
        return self._loaded

    def preprocess_input(self, job_data: Dict) -> Optional:
        """Preprocess job data for model prediction using the saved TF-IDF vectorizer."""
        if not self.preprocessor:
            return None

        # Combine all text fields (same approach as training)
        parts = [
            job_data.get("jobTitle", ""),
            job_data.get("companyName", ""),
            job_data.get("jobDescription", ""),
            job_data.get("requirements", ""),
            job_data.get("salary", ""),
            job_data.get("location", ""),
        ]
        combined_text = " ".join(str(p) for p in parts if p)

        # Clean text (same steps as training)
        import re
        combined_text = combined_text.lower()
        combined_text = re.sub(r"http\S+|www\S+", "", combined_text)
        combined_text = re.sub(r"[^\w\s]", " ", combined_text)
        combined_text = re.sub(r"\d+", "", combined_text)
        combined_text = re.sub(r"\s+", " ", combined_text).strip()

        # Vectorize
        return self.preprocessor.transform([combined_text])

    def predict(self, job_data: Dict) -> Dict:
        """
        Get prediction from all 5 models.

        Returns dict with predictions list, overallRisk, riskScore, and mock flag.
        """
        # Try to load models if not already loaded (in case they were trained after startup)
        if not self._loaded:
            self.load_models()

        if not self._loaded:
            return self._mock_predictions()

        X = self.preprocess_input(job_data)
        if X is None:
            return self._mock_predictions()

        try:
            predictions = []
            scam_votes = 0
            best_confidence = 0
            
            for name, model in self.models.items():
                pred = model.predict(X)[0]
                
                if hasattr(model, "predict_proba"):
                    proba = model.predict_proba(X)[0]
                    confidence = float(proba[1]) if pred == 1 else float(proba[0])
                else:
                    confidence = 0.85
                    
                confidence_percent = round(confidence * 100, 1)
                prediction_label = "scam" if pred == 1 else "genuine"
                
                predictions.append({
                    "algorithm": name,
                    "prediction": prediction_label,
                    "confidence": confidence_percent,
                })
                
                if prediction_label == "scam":
                    scam_votes += 1
                
                if name == "Logistic Regression":
                    best_confidence = float(model.predict_proba(X)[0][0]) * 100 if hasattr(model, "predict_proba") else 50.0

            if scam_votes >= 3:
                overall_risk = "scam"
                risk_score = max(0, round(100 - best_confidence, 1))
            elif scam_votes > 0:
                overall_risk = "suspicious"
                risk_score = round(best_confidence, 1)
            else:
                overall_risk = "genuine"
                risk_score = round(best_confidence, 1)

            return {
                "predictions": predictions,
                "overallRisk": overall_risk,
                "riskScore": risk_score,
                "mock": False,
            }
        except Exception as e:
            print(f"  Error with prediction: {e}")
            return self._mock_predictions()

    def _mock_predictions(self) -> Dict:
        """Return mock predictions when no real models are loaded."""
        return {
            "predictions": [
                {"algorithm": "Logistic Regression", "prediction": "genuine", "confidence": 92.0},
                {"algorithm": "Naive Bayes", "prediction": "scam", "confidence": 78.0},
                {"algorithm": "Random Forest", "prediction": "genuine", "confidence": 88.0},
                {"algorithm": "SVM", "prediction": "genuine", "confidence": 95.0},
                {"algorithm": "KNN", "prediction": "genuine", "confidence": 85.0},
            ],
            "overallRisk": "genuine",
            "riskScore": 92.0,
            "mock": True,
        }


# Global instance
ml_models = MLModels()
