import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Shield, BarChart3, Info, Menu, X, Home, Zap } from "lucide-react";
import { getApiUrl } from "@/lib/utils";
import { toast } from "sonner";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isHomePage = location.pathname === "/";

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setIsOpen(false);

    if (isHomePage) {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate("/", { replace: false });
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  };

  const handleCheckConnection = async () => {
    try {
      const res = await fetch(getApiUrl("/api/health"));
      if (res.ok) {
        toast.success("Backend Connected Successfully!");
      } else {
        toast.error("Backend returned an error.");
      }
    } catch (err) {
      toast.error("Could not connect to Backend.");
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/50 w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          to="/"
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-3 hover:opacity-90 transition-opacity whitespace-nowrap flex-shrink-0"
        >
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-sm">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight">
            JobGuard
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6">
          <a
            href="#features"
            onClick={(e) => handleAnchorClick(e, "features")}
            className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors whitespace-nowrap"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={(e) => handleAnchorClick(e, "how-it-works")}
            className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors whitespace-nowrap"
          >
            How It Works
          </a>
          <Link
            to="/model-insights"
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors whitespace-nowrap ${
              location.pathname === "/model-insights"
                ? "text-primary font-semibold"
                : "text-foreground/70 hover:text-foreground"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Model Insights
          </Link>
          <Link
            to="/about"
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors whitespace-nowrap ${
              location.pathname === "/about"
                ? "text-primary font-semibold"
                : "text-foreground/70 hover:text-foreground"
            }`}
          >
            <Info className="w-4 h-4" />
            About
          </Link>
          <button
            onClick={handleCheckConnection}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors whitespace-nowrap"
          >
            <Shield className="w-3.5 h-3.5" />
            Check Connection
          </button>
          <Link
            to="/detect"
            className="btn-primary text-sm px-4 py-2 whitespace-nowrap"
          >
            Start Detection
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation menu"
            className="p-2 rounded-lg text-foreground/80 hover:text-foreground hover:bg-card border border-border/40 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden border-b border-border/50 bg-background/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === "/"
                ? "bg-primary/10 text-primary font-semibold"
                : "text-foreground/80 hover:bg-card"
            }`}
          >
            <Home className="w-4 h-4" />
            Home
          </Link>

          <a
            href="#features"
            onClick={(e) => handleAnchorClick(e, "features")}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground/80 hover:bg-card transition-colors"
          >
            <Zap className="w-4 h-4 text-primary" />
            Features
          </a>

          <a
            href="#how-it-works"
            onClick={(e) => handleAnchorClick(e, "how-it-works")}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground/80 hover:bg-card transition-colors"
          >
            <Info className="w-4 h-4 text-secondary" />
            How It Works
          </a>

          <Link
            to="/model-insights"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === "/model-insights"
                ? "bg-primary/10 text-primary font-semibold"
                : "text-foreground/80 hover:bg-card"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Model Insights
          </Link>

          <Link
            to="/about"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === "/about"
                ? "bg-primary/10 text-primary font-semibold"
                : "text-foreground/80 hover:bg-card"
            }`}
          >
            <Info className="w-4 h-4" />
            About
          </Link>

          <div className="pt-2 border-t border-border/40 flex flex-col gap-2.5">
            <button
              onClick={() => {
                handleCheckConnection();
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
            >
              <Shield className="w-4 h-4" />
              Check Connection
            </button>

            <Link
              to="/detect"
              onClick={() => setIsOpen(false)}
              className="w-full btn-primary text-sm py-2.5 flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Start Detection
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
