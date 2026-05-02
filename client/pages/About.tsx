import { Link } from "react-router-dom";
import {
  Shield,
  AlertTriangle,
  Lightbulb,
  Settings,
  Rocket,
  ArrowLeft,
  Brain,
  Database,
  BarChart3,
  Code2,
  ExternalLink,
} from "lucide-react";

export default function About() {
  const techStack = [
    {
      category: "Frontend",
      icon: <Code2 className="w-5 h-5" />,
      color: "blue",
      items: ["React 18 + TypeScript", "Vite", "TailwindCSS 3", "Recharts"],
    },
    {
      category: "Backend",
      icon: <Settings className="w-5 h-5" />,
      color: "purple",
      items: ["Python 3.x", "Flask", "Flask-CORS", "python-dotenv"],
    },
    {
      category: "Machine Learning & NLP",
      icon: <Brain className="w-5 h-5" />,
      color: "emerald",
      items: [
        "Scikit-Learn",
        "TF-IDF Vectorizer",
        "Random Forest Classifier",
        "SVM, KNN, Naive Bayes",
      ],
    },
    {
      category: "Data Processing",
      icon: <Database className="w-5 h-5" />,
      color: "amber",
      items: ["Pandas", "NumPy", "NLTK / re", "Joblib (model persistence)"],
    },
    {
      category: "Data Visualization",
      icon: <BarChart3 className="w-5 h-5" />,
      color: "rose",
      items: ["Recharts (React)", "Confidence bar charts", "Risk score meters"],
    },
  ];

  const colorMap: Record<string, string> = {
    blue: "bg-blue-900/30 border-blue-600/50 text-blue-300",
    purple: "bg-purple-900/30 border-purple-600/50 text-purple-300",
    emerald: "bg-emerald-900/30 border-emerald-600/50 text-emerald-300",
    amber: "bg-amber-900/30 border-amber-600/50 text-amber-300",
    rose: "bg-rose-900/30 border-rose-600/50 text-rose-300",
  };

  const models = [
    { name: "Logistic Regression", role: "Baseline Model", acc: "~89%" },
    { name: "Multinomial Naive Bayes", role: "Text Analysis", acc: "~87%" },
    { name: "Random Forest", role: "Ensemble Learning", acc: "~95%" },
    { name: "Support Vector Machine", role: "Powerful Classifier", acc: "~94%" },
    { name: "K-Nearest Neighbors", role: "Instance-Based", acc: "~85%" },
  ];

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
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back Home
            </Link>
            <Link to="/detect" className="btn-primary">
              Start Detection
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16 space-y-16">
        {/* Page Header */}
        <div className="text-center animate-fade-in space-y-4">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium text-sm mb-4">
            <Shield className="w-4 h-4" />
            Academic Mini-Project
          </div>
          <h1 className="text-5xl font-bold text-foreground">
            📋 About the Project
          </h1>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            A comprehensive AI-powered system to detect fraudulent job postings
            using Natural Language Processing and Machine Learning.
          </p>
        </div>

        {/* The Problem */}
        <section className="p-8 rounded-2xl bg-card border-2 border-red-600/30 hover:border-red-500/50 transition-all duration-300">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-red-900/40 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">🚨 The Problem</h2>
          </div>
          <p className="text-foreground/70 leading-relaxed text-base">
            Employment scams are on the rise. Fraudsters create fake job listings to steal personal
            information, bank details, or solicit upfront payments from a vulnerable job-seeking
            population. It is increasingly difficult to distinguish between genuine opportunities
            and malicious scams — especially for fresh graduates and students actively seeking work.
          </p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Scam Job Listings", value: "~17,000+", sub: "in our training dataset" },
              { label: "Avg. Financial Loss", value: "$2,000+", sub: "per victim per incident" },
              { label: "Victims", value: "Mostly", sub: "students & fresh graduates" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-4 rounded-xl bg-red-950/20 border border-red-700/30 text-center"
              >
                <div className="text-2xl font-bold text-red-400 mb-1">{stat.value}</div>
                <div className="text-xs font-semibold text-foreground/80">{stat.label}</div>
                <div className="text-xs text-foreground/50 mt-1">{stat.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Our Solution */}
        <section className="p-8 rounded-2xl bg-card border-2 border-primary/30 hover:border-primary/50 transition-all duration-300">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">💡 Our Solution</h2>
          </div>
          <p className="text-foreground/70 leading-relaxed text-base mb-6">
            This application uses <span className="text-primary font-semibold">Natural Language Processing (NLP)</span> and{" "}
            <span className="text-secondary font-semibold">Machine Learning</span> techniques to
            automatically analyze job posting descriptions and compute a risk score. By identifying
            specific linguistic patterns and suspicious keywords, we can alert users before they fall
            victim. Five different classifiers are trained and compared for maximum accuracy.
          </p>
          <div className="flex flex-wrap gap-3">
            {[
              "TF-IDF Text Vectorization",
              "Multi-Model Consensus",
              "Real-Time Analysis",
              "Confidence Scoring",
              "5 ML Algorithms",
            ].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>

        {/* ML Models */}
        <section className="p-8 rounded-2xl bg-card border-2 border-secondary/30 hover:border-secondary/50 transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0">
              <Brain className="w-5 h-5 text-secondary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">🤖 Machine Learning Models</h2>
          </div>
          <div className="space-y-3">
            {models.map((m, i) => (
              <div
                key={m.name}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/40 hover:border-secondary/40 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">{m.name}</div>
                    <div className="text-xs text-foreground/50">{m.role}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-secondary">{m.acc}</div>
                  <div className="text-xs text-foreground/40">accuracy</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Technologies Used */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <Settings className="w-5 h-5 text-foreground/70" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">⚙️ Technologies Used</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {techStack.map((tech) => (
              <div
                key={tech.category}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${colorMap[tech.color]}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="opacity-80">{tech.icon}</div>
                  <h3 className="font-bold text-base">{tech.category}</h3>
                </div>
                <ul className="space-y-2">
                  {tech.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-foreground/70 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0 opacity-60" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Real-World Impact */}
        <section className="p-8 rounded-2xl bg-card border-2 border-emerald-600/30 hover:border-emerald-500/50 transition-all duration-300">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
              <Rocket className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">🚀 Real-World Impact</h2>
          </div>
          <p className="text-foreground/70 leading-relaxed text-base mb-6">
            Automated scam detection systems can be integrated into large job boards (e.g., LinkedIn,
            Indeed) to flag and remove fraudulent posts before they reach the applicant, creating a
            safer ecosystem for everyone. This project demonstrates a scalable NLP + ML pipeline that
            can be deployed as a microservice behind any job platform.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                icon: "🔗",
                title: "Platform Integration",
                desc: "Can be deployed as a REST API microservice for any job board platform.",
              },
              {
                icon: "📊",
                title: "Scalable Pipeline",
                desc: "TF-IDF + ML pipeline scales to millions of job listings with minimal latency.",
              },
              {
                icon: "🎓",
                title: "Student Safety",
                desc: "Specifically designed to protect students and fresh graduates from employment fraud.",
              },
              {
                icon: "🔍",
                title: "Explainable AI",
                desc: "Multi-model consensus approach provides transparency into how predictions are made.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-700/30"
              >
                <div className="text-2xl mb-2">{item.icon}</div>
                <h4 className="font-semibold text-emerald-300 text-sm mb-1">{item.title}</h4>
                <p className="text-foreground/60 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Dataset Info */}
        <section className="p-8 rounded-2xl bg-card border-2 border-border/40">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <Database className="w-5 h-5 text-foreground/70" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">📂 Dataset</h2>
          </div>
          <p className="text-foreground/70 leading-relaxed text-base mb-4">
            The models are trained on the{" "}
            <span className="text-primary font-semibold">Fake Job Postings Dataset</span> (
            <code className="text-xs bg-muted px-2 py-0.5 rounded">fake_job_postings.csv</code>),
            which contains real and fraudulent job listings with labeled categories including job
            title, description, company profile, requirements, benefits, and employment type.
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { value: "17,880+", label: "Total Records" },
              { value: "~4.8%", label: "Fraudulent Listings" },
              { value: "18", label: "Feature Columns" },
            ].map((s) => (
              <div key={s.label} className="p-4 rounded-xl bg-muted/30 border border-border/30">
                <div className="text-xl font-bold text-primary mb-1">{s.value}</div>
                <div className="text-xs text-foreground/50">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer CTA */}
        <div className="p-8 rounded-2xl gradient-primary text-white text-center">
          <p className="text-white/80 text-sm font-semibold uppercase tracking-widest mb-3">
            Developed for Academic &amp; Professional Demonstration
          </p>
          <h3 className="text-2xl font-bold mb-4">Ready to try it yourself?</h3>
          <Link
            to="/detect"
            className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-8 py-3 rounded-lg hover:bg-white/90 transition-all active:scale-95"
          >
            <ExternalLink className="w-4 h-4" />
            Launch Job Scam Detector
          </Link>
        </div>

        {/* Footer credit */}
        <p className="text-center text-foreground/30 text-sm pb-4">
          Developed for Academic Excellence | ML &amp; NLP Powered
        </p>
      </div>
    </div>
  );
}
