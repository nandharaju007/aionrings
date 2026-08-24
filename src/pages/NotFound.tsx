import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <SEO
        title="Page not found — aiOn"
        description="This aiOn page doesn't exist or has moved. Return to the homepage to explore the aiOn smart wellness ring."
        path="/404"
        image="/og-image.jpg"
        noindex
      />
      <Header />
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-[120px] font-extralight leading-none text-primary/10 mb-4 select-none">404</div>
          <h1 className="text-4xl font-light text-ink mb-4">Page not found</h1>
          <p className="text-ink-soft mb-8 leading-relaxed">
            The page you're looking for doesn't exist or has been moved. 
            Let's get you back on track.
          </p>
          <Link to="/" className="btn-brand">
            Return to Home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
