# JobGuard — AI Job Scam Detector

A full-stack application that uses machine learning to detect fake job postings. The React frontend lets users input job details, and the Flask backend runs 5 ML algorithms to predict whether a job is genuine or a scam.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite + TailwindCSS 3 |
| Backend | Flask (Python) |
| ML | scikit-learn (Logistic Regression, Naive Bayes, Random Forest, SVM, KNN) |
| Charts | Recharts |
| UI | Radix UI + Lucide Icons |

## Project Structure

```
client/                    # React SPA frontend
├── pages/                 # Route pages (Index, Detect, NotFound)
├── components/ui/         # Pre-built UI component library
├── App.tsx                # App entry with SPA routing
└── global.css             # TailwindCSS theming

backend/                   # Flask API + ML backend
├── app.py                 # Main Flask app
├── config.py              # Configuration
├── train_models.py        # Script to train all 5 ML models
├── models/
│   ├── ml_models.py       # Model loading & prediction logic
│   └── trained/           # Saved .pkl model files (auto-generated)
├── routes/
│   └── analysis.py        # /api/analyze-job endpoint
├── utils/
│   └── preprocessing.py   # Text cleaning utilities
├── data/
│   └── fake_job_postings.csv  # Training dataset
└── requirements.txt       # Python dependencies

shared/                    # Shared TypeScript types
```

## Quick Start

### 1. Install Frontend Dependencies

```bash
pnpm install
```

### 2. Set Up Python Backend

```bash
cd backend
pip install -r requirements.txt
```

### 3. Train the ML Models

```bash
cd backend
python train_models.py
```

This trains all 5 algorithms on the dataset and saves the models to `backend/models/trained/`.

### 4. Start the Flask Backend

```bash
cd backend
python app.py
```

The Flask server runs on `http://localhost:5000`.

### 5. Start the Frontend Dev Server

```bash
pnpm dev
```

The Vite dev server runs on `http://localhost:8080` and proxies `/api/*` requests to Flask.

## ML Algorithms

| Algorithm | Type |
|-----------|------|
| Logistic Regression | Baseline linear classifier |
| Multinomial Naive Bayes | Probabilistic text classifier |
| Random Forest | Ensemble of decision trees |
| Support Vector Machine | Linear kernel classifier |
| K-Nearest Neighbors | Instance-based learning |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/analyze-job` | Analyze a job posting |
| `GET` | `/api/models/info` | Get model info & accuracy |

### POST `/api/analyze-job`

**Request:**
```json
{
  "jobTitle": "Senior Developer",
  "companyName": "TechCorp",
  "jobDescription": "We are looking for...",
  "requirements": "3+ years experience",
  "salary": "$100k",
  "location": "Remote"
}
```

**Response:**
```json
{
  "predictions": [
    { "algorithm": "Logistic Regression", "prediction": "genuine", "confidence": 92.5 }
  ],
  "overallRisk": "genuine",
  "riskScore": 90.3,
  "mock": false
}
```

## Development Commands

```bash
pnpm dev        # Start Vite frontend (port 8080)
pnpm build      # Production build
pnpm typecheck  # TypeScript validation
pnpm test       # Run Vitest tests
```
