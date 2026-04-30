import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const STORAGE_KEY = 'aion-cookie-consent';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const handleChoice = (choice: 'accepted' | 'essential' | 'rejected') => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ choice, timestamp: new Date().toISOString() })
    );
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed bottom-4 left-4 right-4 md:left-6 md:right-6 lg:max-w-2xl lg:left-6 z-50"
          role="dialog"
          aria-labelledby="cookie-title"
          aria-describedby="cookie-desc"
        >
          <div className="relative bg-card border border-border rounded-xl shadow-2xl backdrop-blur-md p-6">
            <button
              onClick={() => handleChoice('essential')}
              aria-label="Close cookie banner"
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 id="cookie-title" className="text-base font-medium text-foreground mb-2">
              We value your privacy
            </h3>
            <p id="cookie-desc" className="text-sm text-muted-foreground mb-4">
              aiOn uses cookies to provide essential functionality, analyze usage, and improve your
              experience. You can accept all, choose essential-only, or learn more in our{' '}
              <Link to="/cookie-policy" className="text-primary hover:underline">
                Cookie Policy
              </Link>
              .
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                size="sm"
                onClick={() => handleChoice('accepted')}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Accept all
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleChoice('essential')}
              >
                Essential only
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleChoice('rejected')}
              >
                Reject non-essential
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}