import { Link } from "react-router-dom";
import { Shield, CheckCircle, AlertCircle, Zap, Info, BarChart3 } from "lucide-react";
import { getApiUrl } from "@/lib/utils";
import { toast } from "sonner";

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-card to-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">JobGuard</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="#features"
              className="text-foreground/60 hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-foreground/60 hover:text-foreground transition-colors"
            >
              How It Works
            </a>
            <Link
              to="/model-insights"
              className="flex items-center gap-1.5 text-foreground/60 hover:text-foreground transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              Model Insights
            </Link>
            <Link
              to="/about"
              className="flex items-center gap-1.5 text-foreground/60 hover:text-foreground transition-colors"
            >
              <Info className="w-4 h-4" />
              About
            </Link>
            <button
              onClick={async () => {
                try {
                  const res = await fetch(getApiUrl('/api/health'));
                  if (res.ok) {
                    toast.success("Backend Connected Successfully!");
                  } else {
                    toast.error("Backend returned an error.");
                  }
                } catch (err) {
                  toast.error("Could not connect to Backend.");
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              Check Connection
            </button>
            <Link to="/detect" className="btn-primary">
              Start Detection
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center animate-fade-in">
        <div className="space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
            Detect Fake Jobs Before{" "}
            <span className="gradient-primary bg-clip-text text-transparent">
              You Get Scammed
            </span>
          </h1>
          <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
            JobGuard uses advanced AI and machine learning to analyze job postings and protect you
            from fraudulent offers. Analyze any job posting in seconds with multiple ML algorithms.
          </p>
          <div className="flex gap-4 justify-center pt-6">
            <Link to="/detect" className="btn-primary text-lg">
              <Zap className="w-5 h-5" />
              Start Free Analysis
            </Link>
            <Link
              to="/model-insights"
              className="inline-flex items-center justify-center rounded-lg border-2 border-primary text-primary font-medium px-8 py-3 transition-all hover:bg-primary/20 active:scale-95 gap-2"
            >
              <BarChart3 className="w-5 h-5" />
              Model Insights
            </Link>
          </div>
        </div>

        {/* Hero Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
          <div className="p-6 rounded-xl bg-card border border-border/50 shadow-sm">
            <div className="text-3xl font-bold text-primary mb-2">99.2%</div>
            <p className="text-foreground/60">Detection Accuracy</p>
          </div>
          <div className="p-6 rounded-xl bg-card border border-border/50 shadow-sm">
            <div className="text-3xl font-bold text-secondary mb-2">5 Models</div>
            <p className="text-foreground/60">ML Algorithms Tested</p>
          </div>
          <div className="p-6 rounded-xl bg-card border border-border/50 shadow-sm">
            <div className="text-3xl font-bold text-primary mb-2">&lt;1s</div>
            <p className="text-foreground/60">Analysis Time</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-4xl font-bold text-center text-foreground mb-16">
          Why Choose JobGuard?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Feature 1 */}
          <div className="p-8 rounded-xl bg-card border-2 border-slate-600/50 hover:border-slate-500 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-slate-700/40 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-slate-300" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              Advanced ML Detection
            </h3>
            <p className="text-foreground/60">
              Powered by 5 machine learning algorithms including SVM, Random Forest, and Neural
              networks for the most accurate detection.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-8 rounded-xl bg-card border-2 border-blue-600/50 hover:border-blue-500 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-blue-900/30 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-blue-300" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              Lightning Fast Results
            </h3>
            <p className="text-foreground/60">
              Get instant analysis of any job posting in less than a second. No waiting around.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-8 rounded-xl bg-card border-2 border-emerald-600/50 hover:border-emerald-500 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-emerald-900/30 flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-emerald-300" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              Multi-Model Comparison
            </h3>
            <p className="text-foreground/60">
              Compare predictions from all algorithms and see confidence scores for each model.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-8 rounded-xl bg-card border-2 border-amber-600/50 hover:border-amber-500 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-amber-900/30 flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-amber-300" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              Detailed Risk Analysis
            </h3>
            <p className="text-foreground/60">
              Get detailed breakdowns of what makes a job posting suspicious with visual graphs.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-24 bg-card rounded-2xl">
        <h2 className="text-4xl font-bold text-center text-foreground mb-16">
          How It Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="relative">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Input Job Details</h3>
              <p className="text-sm text-foreground/60">
                Paste the job title, description, and company info
              </p>
            </div>
            {/* Arrow */}
            <div className="hidden md:flex absolute top-8 -right-3 text-primary/30">
              <div>→</div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">AI Analysis</h3>
              <p className="text-sm text-foreground/60">
                Run through all 5 ML models simultaneously
              </p>
            </div>
            {/* Arrow */}
            <div className="hidden md:flex absolute top-8 -right-3 text-primary/30">
              <div>→</div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Get Results</h3>
              <p className="text-sm text-foreground/60">
                See predictions from each algorithm with confidence scores
              </p>
            </div>
            {/* Arrow */}
            <div className="hidden md:flex absolute top-8 -right-3 text-primary/30">
              <div>→</div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Stay Safe</h3>
            <p className="text-sm text-foreground/60">
              Make informed decisions before applying
            </p>
          </div>
        </div>
      </section>

      {/* ML Algorithms Section */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-4xl font-bold text-center text-foreground mb-16">
          Powered by Advanced ML
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { name: "Logistic Regression", desc: "Baseline Model" },
            { name: "Naive Bayes", desc: "Text Analysis" },
            { name: "Random Forest", desc: "Ensemble Learning" },
            { name: "Support Vector Machine", desc: "Powerful Classifier" },
            { name: "K-Nearest Neighbors", desc: "Instance-Based" },
          ].map((algo) => (
            <div
              key={algo.name}
              className="p-6 rounded-lg bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 text-center hover:border-primary/50 transition-all"
            >
              <div className="font-semibold text-foreground text-sm mb-1">{algo.name}</div>
              <p className="text-xs text-foreground/60">{algo.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="gradient-primary rounded-2xl p-12 md:p-16 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Detect Scams?</h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Analyze any job posting right now with our advanced AI detection system.
          </p>
          <Link
            to="/detect"
            className="inline-flex items-center justify-center rounded-lg bg-foreground text-primary font-semibold px-8 py-4 transition-all hover:bg-foreground/90 active:scale-95"
          >
            Start Free Analysis Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/50 backdrop-blur-sm py-8 mt-24">
        <div className="max-w-6xl mx-auto px-6 text-center text-foreground/60">
          <p>
            JobGuard - Protecting students and fresh graduates from job scams using AI &
            Machine Learning
          </p>
          <p className="text-sm mt-4">Built for safety. Powered by intelligence.</p>
        </div>
      </footer>
    </div>
  );
}
