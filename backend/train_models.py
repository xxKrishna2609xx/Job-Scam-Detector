"""
Train all ML models for job scam detection.
Produces: preprocessor.pkl, models_dict.pkl, metadata.pkl
in backend/models/trained/

Usage:
    cd backend && python train_models.py
"""

import os
import re
import pickle
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import LinearSVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
)

# ------- paths -------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "fake_job_postings.csv")
OUTPUT_DIR = os.path.join(BASE_DIR, "models", "trained")
os.makedirs(OUTPUT_DIR, exist_ok=True)


def clean_text(text: str) -> str:
    """Basic text cleaning — mirrors ml_models.preprocess_input."""
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r"http\S+|www\S+", "", text)
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\d+", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def main():
    print("=" * 60)
    print("  Job Scam Detector — Model Training Pipeline")
    print("=" * 60)

    # 1. Load data
    print(f"\n[1/5] Loading dataset from {DATA_PATH} ...")
    df = pd.read_csv(DATA_PATH)
    print(f"       Rows: {len(df)}  |  Columns: {list(df.columns)}")

    # 2. Prepare features
    print("\n[2/5] Preparing text features ...")
    text_columns = ["title", "company_profile", "description", "requirements"]
    for col in text_columns:
        if col not in df.columns:
            df[col] = ""
    df[text_columns] = df[text_columns].fillna("")

    df["combined_text"] = df[text_columns].apply(lambda row: " ".join(row), axis=1)
    df["combined_text"] = df["combined_text"].apply(clean_text)

    # Target column
    if "fraudulent" not in df.columns:
        raise ValueError("Dataset must contain a 'fraudulent' column (0=genuine, 1=scam)")

    X = df["combined_text"]
    y = df["fraudulent"]

    print(f"       Class distribution: {dict(y.value_counts())}")

    # 3. TF-IDF vectorisation
    print("\n[3/5] Vectorising with TF-IDF ...")
    tfidf = TfidfVectorizer(max_features=5000, stop_words="english")
    X_tfidf = tfidf.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(
        X_tfidf, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"       Train: {X_train.shape[0]}  |  Test: {X_test.shape[0]}")

    # 4. Train models
    print("\n[4/5] Training models ...")
    classifiers = {
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
        "Naive Bayes": MultinomialNB(),
        "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42),
        "SVM": LinearSVC(max_iter=2000, random_state=42),
        "KNN": KNeighborsClassifier(n_neighbors=5),
    }

    trained_models = {}
    metadata = {}

    for name, clf in classifiers.items():
        print(f"  -> {name} ...", end=" ")
        clf.fit(X_train, y_train)
        preds = clf.predict(X_test)

        acc = round(accuracy_score(y_test, preds) * 100, 2)
        prec = round(precision_score(y_test, preds, zero_division=0) * 100, 2)
        rec = round(recall_score(y_test, preds, zero_division=0) * 100, 2)
        f1 = round(f1_score(y_test, preds, zero_division=0) * 100, 2)
        cm = confusion_matrix(y_test, preds).tolist()

        trained_models[name] = clf
        metadata[name] = {
            "accuracy": acc,
            "precision": prec,
            "recall": rec,
            "f1": f1,
            "confusion_matrix": cm,
        }
        print(f"Accuracy: {acc}%  Precision: {prec}%  Recall: {rec}%  F1: {f1}%")

    # 5. Save artefacts
    print("\n[5/5] Saving to", OUTPUT_DIR, "...")

    with open(os.path.join(OUTPUT_DIR, "preprocessor.pkl"), "wb") as f:
        pickle.dump(tfidf, f)
    print("       [OK] preprocessor.pkl")

    with open(os.path.join(OUTPUT_DIR, "models_dict.pkl"), "wb") as f:
        pickle.dump(trained_models, f)
    print("       [OK] models_dict.pkl")

    with open(os.path.join(OUTPUT_DIR, "metadata.pkl"), "wb") as f:
        pickle.dump(metadata, f)
    print("       [OK] metadata.pkl")

    print("\n" + "=" * 60)
    print("  Training complete — all 5 models saved!")
    print("=" * 60)


if __name__ == "__main__":
    main()
