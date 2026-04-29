import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  ArrowLeft,
  Send,
  AlertCircle,
  CheckCircle,
  BarChart3,
  AlertTriangle,
  Download,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface PredictionResult {
  algorithm: string;
  prediction: "genuine" | "scam";
  confidence: number;
  color: string;
}

interface AnalysisResults {
  predictions: PredictionResult[];
  overallRisk: "genuine" | "suspicious" | "scam";
  riskScore: number;
  mock?: boolean;
}

export default function Detect() {
  const [formData, setFormData] = useState({
    jobTitle: "",
    companyName: "",
    jobDescription: "",
    requirements: "",
    salary: "",
    location: "",
  });

  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("all");
  const [isMockData, setIsMockData] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setIsMockData(false);

    try {
      const response = await fetch("/api/analyze-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const data = await response.json();
      setResults(data);
      setIsMockData(data.mock === true);
    } catch (error) {
      console.error("Error analyzing job:", error);
      // Fallback mock data — clearly flagged
      setIsMockData(true);
      setResults({
        predictions: [
          { algorithm: "Logistic Regression", prediction: "genuine", confidence: 92, color: "#10B981" },
          { algorithm: "Naive Bayes", prediction: "scam", confidence: 78, color: "#EF4444" },
          { algorithm: "Random Forest", prediction: "genuine", confidence: 88, color: "#10B981" },
          { algorithm: "SVM", prediction: "genuine", confidence: 95, color: "#10B981" },
          { algorithm: "KNN", prediction: "genuine", confidence: 85, color: "#10B981" },
        ],
        overallRisk: "genuine",
        riskScore: 88,
        mock: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPredictions = results?.predictions.filter(
    (p) => selectedAlgorithm === "all" || p.prediction === selectedAlgorithm
  ) || [];

  const chartData = filteredPredictions.map((p) => ({
    name: p.algorithm.split(" ")[0],
    confidence: p.confidence,
    fill: p.prediction === "genuine" ? "#10B981" : "#EF4444",
  }));

  const handleExportReport = () => {
    if (!results) return;

    const report = {
      generatedAt: new Date().toISOString(),
      jobDetails: formData,
      analysis: {
        overallRisk: results.overallRisk,
        riskScore: results.riskScore,
        isMockData: isMockData,
        predictions: results.predictions,
      },
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jobguard-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-card to-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">JobGuard</span>
          </Link>
          <Link to="/" className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back Home
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 p-8 rounded-2xl bg-card border border-border/50">
              <h2 className="text-2xl font-bold text-foreground mb-6">Analyze Job</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Job Title */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Job Title
                  </label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    placeholder="e.g., Senior Developer"
                    className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    required
                  />
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="e.g., TechCorp Inc"
                    className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    required
                  />
                </div>

                {/* Job Description */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Job Description
                  </label>
                  <textarea
                    name="jobDescription"
                    value={formData.jobDescription}
                    onChange={handleInputChange}
                    placeholder="Paste the full job description..."
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                    required
                  />
                </div>

                {/* Requirements */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Requirements
                  </label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    placeholder="List the job requirements..."
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                  />
                </div>

                {/* Salary */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Salary (Optional)
                  </label>
                  <input
                    type="text"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    placeholder="e.g., $100k - $150k"
                    className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Location (Optional)
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Remote or City, Country"
                    className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Analyze Job
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            {loading ? (
              /* Loading Skeleton */
              <div className="p-12 rounded-2xl bg-card border border-border/50 flex flex-col items-center justify-center min-h-[600px] text-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Analyzing Job Posting...
                </h3>
                <p className="text-foreground/60 max-w-sm">
                  Running analysis through all 5 machine learning models. This won't take long.
                </p>
              </div>
            ) : !results ? (
              <div className="p-12 rounded-2xl bg-card border border-border/50 flex flex-col items-center justify-center min-h-[600px] text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <BarChart3 className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Ready to Analyze?
                </h3>
                <p className="text-foreground/60 max-w-sm">
                  Fill in the job details on the left and click "Analyze Job" to get AI-powered
                  predictions from our 5 machine learning models.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Demo Mode Banner */}
                {isMockData && (
                  <div className="p-4 rounded-xl bg-amber-900/30 border border-amber-600/50 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-amber-300 text-sm">Demo Mode</h4>
                      <p className="text-amber-200/70 text-sm mt-1">
                        The backend server is not connected or models are not loaded. Showing
                        simulated results. Start the Flask server with trained models for real
                        predictions.
                      </p>
                    </div>
                  </div>
                )}

                {/* Overall Risk Card */}
                <div
                  className={`p-8 rounded-2xl border-2 ${
                    results.overallRisk === "genuine"
                      ? "bg-green-900/20 border-green-600/50"
                      : results.overallRisk === "suspicious"
                        ? "bg-yellow-900/20 border-yellow-600/50"
                        : "bg-red-900/20 border-red-600/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Overall Assessment
                      </h3>
                      <p
                        className={`text-sm font-medium ${
                          results.overallRisk === "genuine"
                            ? "text-green-400"
                            : results.overallRisk === "suspicious"
                              ? "text-yellow-400"
                              : "text-red-400"
                        }`}
                      >
                        {results.overallRisk === "genuine"
                          ? "This job appears to be GENUINE"
                          : results.overallRisk === "suspicious"
                            ? "This job appears SUSPICIOUS"
                            : "This job appears to be a SCAM"}
                      </p>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-4xl font-bold mb-1 ${
                          results.overallRisk === "genuine"
                            ? "text-green-400"
                            : results.overallRisk === "suspicious"
                              ? "text-yellow-400"
                              : "text-red-400"
                        }`}
                      >
                        {results.riskScore}%
                      </div>
                      <p className="text-xs text-foreground/60">Legitimacy Score</p>
                    </div>
                  </div>
                </div>

                {/* Algorithm Filter */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Filter Results
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setSelectedAlgorithm("all")}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        selectedAlgorithm === "all"
                          ? "bg-primary text-white"
                          : "bg-muted text-foreground hover:bg-muted/80"
                      }`}
                    >
                      All Models
                    </button>
                    <button
                      onClick={() => setSelectedAlgorithm("genuine")}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        selectedAlgorithm === "genuine"
                          ? "bg-green-500 text-white"
                          : "bg-muted text-foreground hover:bg-muted/80"
                      }`}
                    >
                      Genuine
                    </button>
                    <button
                      onClick={() => setSelectedAlgorithm("scam")}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        selectedAlgorithm === "scam"
                          ? "bg-red-500 text-white"
                          : "bg-muted text-foreground hover:bg-muted/80"
                      }`}
                    >
                      Scam
                    </button>
                  </div>
                </div>

                {/* Chart — now respects the filter */}
                <div className="p-6 rounded-2xl bg-card border border-border/50">
                  <h3 className="text-lg font-semibold text-foreground mb-6">
                    Model Confidence Comparison
                  </h3>
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1f2937",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                            color: "#f3f4f6",
                          }}
                          formatter={(value: number) => [`${value}%`, "Confidence"]}
                        />
                        <Bar dataKey="confidence" radius={[8, 8, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <rect key={index} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-foreground/60 py-12">
                      No models match the selected filter.
                    </p>
                  )}
                </div>

                {/* Detailed Predictions */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Algorithm Predictions</h3>
                  {filteredPredictions.length > 0 ? (
                    filteredPredictions.map((result, idx) => (
                      <div
                        key={result.algorithm}
                        className="p-6 rounded-xl border border-border/50 bg-card hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">
                              {result.algorithm}
                            </h4>
                            <div className="flex items-center gap-2">
                              {result.prediction === "genuine" ? (
                                <div className="flex items-center gap-2 text-green-400 font-medium">
                                  <CheckCircle className="w-4 h-4" />
                                  Predicted: GENUINE
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-red-400 font-medium">
                                  <AlertCircle className="w-4 h-4" />
                                  Predicted: SCAM
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary mb-1">
                              {result.confidence}%
                            </div>
                            <p className="text-xs text-foreground/60">Confidence</p>
                          </div>
                        </div>

                        {/* Confidence Meter */}
                        <div className="mt-4 w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              result.prediction === "genuine"
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${result.confidence}%` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-foreground/60 py-8">
                      No models match the selected filter.
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => {
                      setResults(null);
                      setIsMockData(false);
                      setSelectedAlgorithm("all");
                      setFormData({
                        jobTitle: "",
                        companyName: "",
                        jobDescription: "",
                        requirements: "",
                        salary: "",
                        location: "",
                      });
                    }}
                    className="flex-1 px-6 py-3 rounded-lg border-2 border-primary text-primary font-medium hover:bg-primary/10 transition-all"
                  >
                    Analyze Another Job
                  </button>
                  <button
                    onClick={handleExportReport}
                    className="flex-1 px-6 py-3 rounded-lg btn-primary flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export Report
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
