# ML Models module — loads trained models and runs predictions

import os
import pickle
from typing import Dict, List, Tuple, Optional


# Human-readable names for each algorithm
ALGORITHM_NAMES = {
    "logistic_regression": "Logistic Regression",
    "naive_bayes": "Naive Bayes",
    "random_forest": "Random Forest",
    "svm": "Support Vector Machine",
    "knn": "K-Nearest Neighbors",
}

MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "trained")


class MLModels:
    """
    Manages loading and using ML models for job scam detection.
    Falls back to mock predictions if models aren't trained yet.
    """

    def __init__(self):
        self.models: Dict = {}
        self.preprocessor = None
        self.metadata: Dict = {}
        self._loaded = False
        self.load_models()

    def load_models(self):
        """Load all trained ML models and preprocessor from disk."""
        try:
            # Load preprocessor
            preprocessor_path = os.path.join(MODEL_DIR, "preprocessor.pkl")
            if not os.path.exists(preprocessor_path):
                print("[WARN] Preprocessor not found. Run train_models.py first.")
                return

            with open(preprocessor_path, "rb") as f:
                self.preprocessor = pickle.load(f)

            # Load each model
            for key in ALGORITHM_NAMES:
                model_path = os.path.join(MODEL_DIR, f"{key}.pkl")
                if os.path.exists(model_path):
                    with open(model_path, "rb") as f:
                        self.models[key] = pickle.load(f)
                    print(f"  [OK] Loaded {key}")
                else:
                    print(f"  [MISS] Missing {model_path}")

            # Load accuracy metadata if available
            metadata_path = os.path.join(MODEL_DIR, "metadata.pkl")
            if os.path.exists(metadata_path):
                with open(metadata_path, "rb") as f:
                    self.metadata = pickle.load(f)

            self._loaded = len(self.models) > 0 and self.preprocessor is not None
            if self._loaded:
                print(f"[OK] Loaded {len(self.models)} models successfully")
            else:
                print("[WARN] No models loaded -- will use mock predictions")

        except Exception as e:
            print(f"[ERROR] Error loading models: {e}")
            self._loaded = False

    def is_loaded(self) -> bool:
        """Return whether real trained models are available."""
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
        Get predictions from all models.

        Returns dict with predictions list, overallRisk, riskScore, and mock flag.
        """
        if not self._loaded:
            return self._mock_predictions()

        X = self.preprocess_input(job_data)
        if X is None:
            return self._mock_predictions()

        predictions = []
        for key, model in self.models.items():
            try:
                pred = model.predict(X)[0]
                # Get probability if available
                if hasattr(model, "predict_proba"):
                    proba = model.predict_proba(X)[0]
                    confidence = round(float(max(proba)) * 100, 1)
                else:
                    confidence = 85.0  # fallback if no probability support

                predictions.append({
                    "algorithm": ALGORITHM_NAMES.get(key, key),
                    "prediction": "scam" if pred == 1 else "genuine",
                    "confidence": confidence,
                })
            except Exception as e:
                print(f"  Error with {key}: {e}")

        overall_risk, risk_score = self.aggregate_predictions(predictions)

        return {
            "predictions": predictions,
            "overallRisk": overall_risk,
            "riskScore": risk_score,
            "mock": False,
        }

    def aggregate_predictions(self, predictions: List) -> Tuple[str, float]:
        """
        Aggregate predictions using majority voting and average confidence.

        Returns (overall_risk, risk_score).
        """
        if not predictions:
            return "genuine", 50.0

        scam_votes = sum(1 for p in predictions if p["prediction"] == "scam")
        genuine_votes = len(predictions) - scam_votes
        avg_confidence = sum(p["confidence"] for p in predictions) / len(predictions)

        if scam_votes > genuine_votes:
            # Majority says scam
            overall_risk = "scam"
            risk_score = round(100 - avg_confidence, 1)  # low legitimacy
        elif scam_votes == genuine_votes:
            overall_risk = "suspicious"
            risk_score = round(avg_confidence * 0.5, 1)
        else:
            overall_risk = "genuine"
            risk_score = round(avg_confidence, 1)

        return overall_risk, risk_score

    def _mock_predictions(self) -> Dict:
        """Return mock predictions when no real models are loaded."""
        return {
            "predictions": [
                {"algorithm": "Logistic Regression", "prediction": "genuine", "confidence": 85.0},
                {"algorithm": "Naive Bayes", "prediction": "genuine", "confidence": 78.0},
                {"algorithm": "Random Forest", "prediction": "genuine", "confidence": 91.0},
                {"algorithm": "Support Vector Machine", "prediction": "genuine", "confidence": 88.0},
                {"algorithm": "K-Nearest Neighbors", "prediction": "genuine", "confidence": 82.0},
            ],
            "overallRisk": "genuine",
            "riskScore": 85.0,
            "mock": True,
        }


# Global instance
ml_models = MLModels()
