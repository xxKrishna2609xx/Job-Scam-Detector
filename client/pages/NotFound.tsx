import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl text-foreground/60 mb-8">Oops! Page not found</p>
        <Link
          to="/"
          className="btn-primary inline-flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
