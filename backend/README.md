# Job Scam Detection - Flask Backend

This is the Python Flask backend for the Job Scam Detection application. It handles ML model predictions and job analysis.

## Project Structure

```
backend/
├── app.py                 # Main Flask application
├── config.py             # Configuration settings
├── requirements.txt      # Python dependencies
├── .env.example          # Environment variables template
├── models/
│   ├── __init__.py
│   ├── ml_models.py      # ML model loading and prediction logic
│   └── trained/          # Directory for your trained model files (.pkl)
├── routes/
│   ├── __init__.py
│   └── analysis.py       # API endpoints for job analysis
├── utils/
│   ├── __init__.py
│   └── preprocessing.py  # Data preprocessing utilities
└── data/
    └── (Your dataset files go here)
```

## Setup Instructions

### 1. Create a Python Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```
FLASK_ENV=development
FLASK_PORT=5000
DEBUG=True
```

### 4. Train Your ML Models

You need to:
1. Load your Kaggle dataset into `backend/data/` directory
2. Train your 5 ML algorithms (Logistic Regression, Naive Bayes, Random Forest, SVM, KNN)
3. Save the trained models to `backend/models/trained/` as pickle files:
   - `logistic_regression.pkl`
   - `naive_bayes.pkl`
   - `random_forest.pkl`
   - `svm.pkl`
   - `knn.pkl`

Also save your preprocessor (TfidfVectorizer or similar) as:
   - `preprocessor.pkl`

### 5. Implement Model Loading and Prediction

Edit `backend/models/ml_models.py`:
1. Implement the `load_models()` method to load your trained models
2. Implement the `load_preprocessor()` method
3. Implement the `preprocess_input()` method
4. Implement the `predict()` method to get predictions from all models
5. Implement the `aggregate_predictions()` method to combine results

### 6. Run the Flask Server

```bash
python app.py
```

The server will be available at `http://localhost:5000`

## API Endpoints

### Health Check
- **GET** `/api/health`
  - Response: `{"status": "healthy", "message": "Flask backend is running"}`

### Analyze Job Posting
- **POST** `/api/analyze-job`
  - Request body:
    ```json
    {
      "jobTitle": "Senior Developer",
      "companyName": "TechCorp",
      "jobDescription": "We are looking for...",
      "requirements": "Experience with...",
      "salary": "$100k - $150k",
      "location": "Remote"
    }
    ```
  - Response:
    ```json
    {
      "predictions": [
        {
          "algorithm": "Logistic Regression",
          "prediction": "genuine",
          "confidence": 92
        },
        ...
      ],
      "overallRisk": "genuine",
      "riskScore": 88
    }
    ```

### Get Available Models
- **GET** `/api/models/info`
  - Response: List of available ML models and their info

## Key Implementation Tasks

### 1. Data Preprocessing (`utils/preprocessing.py`)
- Implement text cleaning (remove URLs, special characters, etc.)
- Create feature extraction from job data
- Implement the same preprocessing used during model training

### 2. Model Management (`models/ml_models.py`)
- Load all 5 trained models from pickle files
- Load the preprocessor/vectorizer
- Implement prediction logic for each model
- Aggregate predictions and calculate risk scores

### 3. API Routes (`routes/analysis.py`)
- Already set up basic structure
- Add error handling and validation
- Implement proper response formatting

## Training Your Models

Here's a suggested approach for training your models:

```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
import pickle
import pandas as pd

# Load your Kaggle dataset
df = pd.read_csv('backend/data/your_dataset.csv')

# Preprocess and vectorize
vectorizer = TfidfVectorizer(max_features=1000)
X = vectorizer.fit_transform(df['job_text'])  # Combine relevant columns
y = df['label']  # 0 for genuine, 1 for scam

# Split data
from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Train models
models = {
    'logistic_regression': LogisticRegression(max_iter=1000),
    'naive_bayes': MultinomialNB(),
    'random_forest': RandomForestClassifier(n_estimators=100),
    'svm': SVC(probability=True),
    'knn': KNeighborsClassifier(n_neighbors=5)
}

for name, model in models.items():
    model.fit(X_train, y_train)
    with open(f'backend/models/trained/{name}.pkl', 'wb') as f:
        pickle.dump(model, f)

# Save vectorizer
with open('backend/models/trained/preprocessor.pkl', 'wb') as f:
    pickle.dump(vectorizer, f)
```

## Running in Production

To run in production with Gunicorn:

```bash
gunicorn --workers 4 --bind 0.0.0.0:5000 app:app
```

## Troubleshooting

- **ModuleNotFoundError**: Make sure your virtual environment is activated and all dependencies are installed
- **Model not found**: Ensure trained models are in `backend/models/trained/`
- **CORS errors**: Check your `.env` file CORS_ORIGINS setting
- **Port already in use**: Change FLASK_PORT in `.env`

## Support

For Flask documentation, visit: https://flask.palletsprojects.com/
For scikit-learn documentation, visit: https://scikit-learn.org/
