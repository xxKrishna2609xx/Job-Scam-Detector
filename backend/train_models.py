"""
Train all 5 ML models for Job Scam Detection.

Usage:
    cd backend
    python train_models.py

This script will:
1. Load the fake_job_postings.csv dataset
2. Preprocess the text data
3. Train 5 ML algorithms (Logistic Regression, Naive Bayes, Random Forest, SVM, KNN)
4. Save trained models and preprocessor as .pkl files to models/trained/
5. Print accuracy metrics for each model
"""

import os
import pickle
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "fake_job_postings.csv")
MODEL_DIR = os.path.join(BASE_DIR, "models", "trained")


def load_dataset():
    """Load and validate the dataset."""
    print(f"Loading dataset from {DATA_PATH}...")
    df = pd.read_csv(DATA_PATH)
    print(f"  Loaded {len(df)} records")
    print(f"  Columns: {list(df.columns)}")
    print(f"  Fraudulent distribution:\n{df['fraudulent'].value_counts().to_string()}")
    return df


def preprocess_data(df):
    """Preprocess the dataset for training."""
    print("\nPreprocessing data...")

    # Use the 'text' column if available (pre-combined), otherwise combine title + description
    if "text" in df.columns:
        texts = df["text"].fillna("")
    else:
        title = df["title"].fillna("") if "title" in df.columns else ""
        description = df["description"].fillna("") if "description" in df.columns else ""
        texts = title + " " + description

    labels = df["fraudulent"].astype(int)

    # Clean text
    texts = texts.str.lower()
    texts = texts.str.replace(r"http\S+|www\S+", "", regex=True)
    texts = texts.str.replace(r"[^\w\s]", " ", regex=True)
    texts = texts.str.replace(r"\d+", "", regex=True)
    texts = texts.str.replace(r"\s+", " ", regex=True).str.strip()

    print(f"  Total samples: {len(texts)}")
    print(f"  Genuine: {(labels == 0).sum()}, Scam: {(labels == 1).sum()}")

    return texts, labels


def train_models(X_train, X_test, y_train, y_test):
    """Train all 5 ML models and return results."""
    models = {
        "logistic_regression": LogisticRegression(max_iter=1000, random_state=42),
        "naive_bayes": MultinomialNB(),
        "random_forest": RandomForestClassifier(n_estimators=100, random_state=42),
        "svm": SVC(probability=True, kernel="linear", random_state=42),
        "knn": KNeighborsClassifier(n_neighbors=5),
    }

    results = {}
    for name, model in models.items():
        print(f"\n  Training {name}...")
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        report = classification_report(y_test, y_pred, output_dict=True, zero_division=0)
        cm = confusion_matrix(y_test, y_pred).tolist()
        results[name] = {
            "model": model,
            "accuracy": accuracy,
            "report": report,
            "cm": cm,
        }
        print(f"    Accuracy: {accuracy:.4f}")

    return results


def save_models(results, vectorizer):
    """Save trained models and vectorizer to disk."""
    os.makedirs(MODEL_DIR, exist_ok=True)

    for name, data in results.items():
        model_path = os.path.join(MODEL_DIR, f"{name}.pkl")
        with open(model_path, "wb") as f:
            pickle.dump(data["model"], f)
        print(f"  Saved {model_path}")

    # Save vectorizer
    vectorizer_path = os.path.join(MODEL_DIR, "preprocessor.pkl")
    with open(vectorizer_path, "wb") as f:
        pickle.dump(vectorizer, f)
    print(f"  Saved {vectorizer_path}")

    # Save full metrics metadata
    metadata = {}
    for name, data in results.items():
        # Scikit-learn classification_report uses '1' or '1.0' for the scam class, '0' or '0.0' for genuine
        # or 'macro avg', 'weighted avg'. We want the '1' class metrics if present, or weighted average.
        scam_metrics = data['report'].get('1', data['report'].get('1.0', data['report']['weighted avg']))
        
        metadata[name] = {
            "accuracy": data["accuracy"],
            "precision": scam_metrics["precision"],
            "recall": scam_metrics["recall"],
            "f1": scam_metrics["f1-score"],
            "tp": data["cm"][1][1],
            "tn": data["cm"][0][0],
            "fp": data["cm"][0][1],
            "fn": data["cm"][1][0],
        }
        
    metadata_path = os.path.join(MODEL_DIR, "metadata.pkl")
    with open(metadata_path, "wb") as f:
        pickle.dump(metadata, f)
    print(f"  Saved {metadata_path}")


def main():
    print("=" * 60)
    print("  Job Scam Detection — Model Training")
    print("=" * 60)

    # Load data
    df = load_dataset()

    # Preprocess
    texts, labels = preprocess_data(df)

    # Vectorize
    print("\nVectorizing text with TF-IDF...")
    vectorizer = TfidfVectorizer(max_features=5000, stop_words="english")
    X = vectorizer.fit_transform(texts)
    print(f"  Feature matrix shape: {X.shape}")

    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, labels, test_size=0.2, random_state=42, stratify=labels
    )
    print(f"  Train: {X_train.shape[0]}, Test: {X_test.shape[0]}")

    # Train
    print("\n--- Training Models ---")
    results = train_models(X_train, X_test, y_train, y_test)

    # Summary
    print("\n" + "=" * 60)
    print("  Model Accuracy Summary")
    print("=" * 60)
    for name, data in results.items():
        display_name = name.replace("_", " ").title()
        print(f"  {display_name:.<30} {data['accuracy']:.2%}")

    # Save
    print("\n--- Saving Models ---")
    save_models(results, vectorizer)

    print("\n[OK] All models trained and saved successfully!")
    print(f"   Model directory: {MODEL_DIR}")


if __name__ == "__main__":
    main()
