import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
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
  Info,
  Zap,
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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getApiUrl } from "@/lib/utils";
import { toast } from "sonner";

interface PredictionResult {
  algorithm: string;
  prediction: "genuine" | "scam";
  confidence: number;
  color: string;
}

interface FieldValidation {
  field: string;
  valid: boolean;
  message: string;
}

interface ValidationResult {
  is_valid: boolean;
  fields: FieldValidation[];
  summary: string;
}

interface AnalysisResults {
  status?: "success" | "validation_failed";
  validation?: ValidationResult;
  predictions: PredictionResult[];
  overallRisk: "genuine" | "suspicious" | "scam" | null;
  riskScore: number | null;
  aiExplanation?: string | null;
  redFlags?: string[];
  trustSignals?: string[];
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
      const response = await fetch(getApiUrl("/api/analyze-job"), {
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
        status: "success",
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

    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text("JobGuard Analysis Report", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    
    // Overall Assessment
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Overall Assessment", 14, 45);
    
    doc.setFontSize(12);
    let riskColor: [number, number, number] = [0, 0, 0];
    let riskText = "";
    if (results.overallRisk === "genuine") {
        riskColor = [16, 185, 129]; // green
        riskText = "GENUINE";
    } else if (results.overallRisk === "suspicious") {
        riskColor = [234, 179, 8]; // yellow
        riskText = "SUSPICIOUS";
    } else if (results.overallRisk === "scam") {
        riskColor = [239, 68, 68]; // red
        riskText = "SCAM";
    } else {
        riskColor = [100, 100, 100];
        riskText = "INVALID INPUT";
    }
    
    doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
    doc.text(`Risk Level: ${riskText} ${results.riskScore !== null ? `(Score: ${results.riskScore}%)` : ''}`, 14, 55);

    if (isMockData) {
        doc.setTextColor(234, 179, 8);
        doc.text("Note: This report was generated using DEMO mode data.", 14, 63);
    }
    
    // Job Details Table
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Job Details", 14, isMockData ? 78 : 70);
    
    autoTable(doc, {
        startY: isMockData ? 82 : 74,
        head: [['Field', 'Value']],
        body: [
            ['Job Title', formData.jobTitle || 'N/A'],
            ['Company', formData.companyName || 'N/A'],
            ['Location', formData.location || 'N/A'],
            ['Salary', formData.salary || 'N/A'],
        ],
        theme: 'striped',
        headStyles: { fillColor: [63, 63, 70] }
    });

    if (results.status === "success") {
      // Model Predictions Table
      const lastAutoTableY = (doc as any).lastAutoTable?.finalY || 120;
      
      doc.text("Model Predictions", 14, lastAutoTableY + 15);
      
      const predictionBody = results.predictions.map(p => [
          p.algorithm,
          p.prediction.toUpperCase(),
          `${p.confidence}%`
      ]);

      autoTable(doc, {
          startY: lastAutoTableY + 20,
          head: [['Algorithm', 'Prediction', 'Confidence']],
          body: predictionBody,
          theme: 'striped',
          headStyles: { fillColor: [63, 63, 70] },
          didParseCell: function(data) {
              if (data.section === 'body' && data.column.index === 1) {
                  if (data.cell.raw === 'GENUINE') {
                      data.cell.styles.textColor = [16, 185, 129];
                      data.cell.styles.fontStyle = 'bold';
                  } else if (data.cell.raw === 'SCAM') {
                      data.cell.styles.textColor = [239, 68, 68];
                      data.cell.styles.fontStyle = 'bold';
                  }
              }
          }
      });

      // Agentic AI Analysis Section
      if (results.aiExplanation) {
        let aiY = (doc as any).lastAutoTable?.finalY || 120;
        
        // Add new page if we're too far down
        if (aiY > 240) {
            doc.addPage();
            aiY = 20;
        } else {
            aiY += 20;
        }

        doc.setFontSize(14);
        doc.setTextColor(79, 70, 229); // Indigo for AI
        doc.text("Agentic AI Analysis", 14, aiY);
        
        doc.setFontSize(11);
        doc.setTextColor(60, 60, 60);
        
        // Wrap text for explanation
        const splitExplanation = doc.splitTextToSize(results.aiExplanation, 180);
        doc.text(splitExplanation, 14, aiY + 8);
        
        let flagsY = aiY + 8 + (splitExplanation.length * 6) + 5;
        
        if (results.redFlags && results.redFlags.length > 0) {
            if (flagsY > 270) { doc.addPage(); flagsY = 20; }
            doc.setFontSize(12);
            doc.setTextColor(220, 38, 38); // Red
            doc.text("Red Flags:", 14, flagsY);
            
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            results.redFlags.forEach((flag) => {
                flagsY += 6;
                const splitFlag = doc.splitTextToSize(`• ${flag}`, 175);
                doc.text(splitFlag, 18, flagsY);
                flagsY += (splitFlag.length - 1) * 5;
            });
            flagsY += 5;
        }
        
        if (results.trustSignals && results.trustSignals.length > 0) {
            if (flagsY > 270) { doc.addPage(); flagsY = 20; }
            doc.setFontSize(12);
            doc.setTextColor(22, 163, 74); // Green
            doc.text("Trust Signals:", 14, flagsY);
            
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            results.trustSignals.forEach((signal) => {
                flagsY += 6;
                const splitSignal = doc.splitTextToSize(`• ${signal}`, 175);
                doc.text(splitSignal, 18, flagsY);
                flagsY += (splitSignal.length - 1) * 5;
            });
        }
      }
    }

    // Save PDF
    doc.save(`jobguard-report-${Date.now()}.pdf`);
  };

  const getFieldError = (fieldName: string) => {
    if (results?.status === "validation_failed" && results.validation?.fields) {
      const field = results.validation.fields.find((f) => f.field === fieldName);
      if (field && !field.valid) {
        return field.message;
      }
    }
    return null;
  };

  const renderInput = (label: string, name: string, placeholder: string, type = "text", required = false) => {
    const error = getFieldError(name);
    return (
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {type === "textarea" ? (
          <textarea
            name={name}
            value={(formData as any)[name]}
            onChange={handleInputChange}
            placeholder={placeholder}
            rows={name === "jobDescription" ? 4 : 3}
            className={`w-full px-4 py-2 rounded-lg bg-input border focus:outline-none focus:ring-2 transition-all resize-none ${
              error ? "border-red-500 focus:ring-red-500/50" : "border-border focus:ring-primary/50"
            }`}
            required={required}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={(formData as any)[name]}
            onChange={handleInputChange}
            placeholder={placeholder}
            className={`w-full px-4 py-2 rounded-lg bg-input border focus:outline-none focus:ring-2 transition-all ${
              error ? "border-red-500 focus:ring-red-500/50" : "border-border focus:ring-primary/50"
            }`}
            required={required}
          />
        )}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-card to-background">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 p-8 rounded-2xl bg-card border border-border/50">
              <h2 className="text-2xl font-bold text-foreground mb-6">Analyze Job</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {renderInput("Job Title", "jobTitle", "e.g., Senior Developer", "text", true)}
                {renderInput("Company Name", "companyName", "e.g., TechCorp Inc", "text", true)}
                {renderInput("Job Description", "jobDescription", "Paste the full job description...", "textarea", true)}
                {renderInput("Requirements", "requirements", "List the job requirements...", "textarea")}
                {renderInput("Salary (Optional)", "salary", "e.g., $100k - $150k")}
                {renderInput("Location (Optional)", "location", "e.g., Remote or City, Country")}

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
                  Our AI agents are validating input, running machine learning models, and generating a detailed explanation. This might take a few seconds.
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
                  predictions and explanations from our LangGraph multi-agent system.
                </p>
              </div>
            ) : results.status === "validation_failed" ? (
              <div className="p-12 rounded-2xl bg-red-900/10 border border-red-500/30 flex flex-col items-center justify-center min-h-[600px] text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-red-500 mb-2">
                  Invalid Input Detected
                </h3>
                <p className="text-foreground/80 max-w-md mb-6">
                  {results.validation?.summary || "Our AI agent detected gibberish or improperly formatted data in your submission. We cannot run machine learning models on this input."}
                </p>
                <div className="w-full text-left bg-background/50 p-4 rounded-lg border border-border">
                  <h4 className="font-semibold text-foreground mb-3 text-sm">Issues Found:</h4>
                  <ul className="space-y-2">
                    {results.validation?.fields?.filter(f => !f.valid).map((field, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-medium capitalize">{field.field.replace(/([A-Z])/g, ' $1').trim()}: </span>
                          <span className="text-foreground/70">{field.message}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => setResults(null)}
                  className="mt-8 px-6 py-2 rounded-lg border-2 border-red-500 text-red-500 font-medium hover:bg-red-500/10 transition-all"
                >
                  Fix Inputs & Try Again
                </button>
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

                {/* AI Explanation Card */}
                {results.aiExplanation && (
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/30">
                    <div className="flex items-center gap-2 mb-4">
                      <Zap className="w-5 h-5 text-indigo-400" />
                      <h3 className="text-lg font-semibold text-foreground">
                        Agentic AI Analysis
                      </h3>
                    </div>
                    <p className="text-foreground/80 leading-relaxed text-sm mb-6">
                      {results.aiExplanation}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {results.redFlags && results.redFlags.length > 0 && (
                        <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-4">
                          <h4 className="text-red-400 font-medium text-sm flex items-center gap-1.5 mb-3">
                            <AlertTriangle className="w-4 h-4" /> Red Flags
                          </h4>
                          <ul className="space-y-2">
                            {results.redFlags.map((flag, idx) => (
                              <li key={idx} className="text-xs text-red-200/70 flex items-start gap-1.5">
                                <span className="text-red-500 mt-0.5">•</span> {flag}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {results.trustSignals && results.trustSignals.length > 0 && (
                        <div className="bg-green-950/30 border border-green-900/50 rounded-xl p-4">
                          <h4 className="text-green-400 font-medium text-sm flex items-center gap-1.5 mb-3">
                            <CheckCircle className="w-4 h-4" /> Trust Signals
                          </h4>
                          <ul className="space-y-2">
                            {results.trustSignals.map((signal, idx) => (
                              <li key={idx} className="text-xs text-green-200/70 flex items-start gap-1.5">
                                <span className="text-green-500 mt-0.5">•</span> {signal}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Algorithm Filter */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Filter ML Results
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
