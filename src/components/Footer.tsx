import { Link } from 'react-router-dom';
import { AionLogo } from './AionLogo';

const footerLinks = {
  Product: [
    { label: 'The Ring', href: '/shop' },
    { label: 'Features', href: '/#features' },
    { label: 'Intelligence', href: '/#intelligence' },
  ],
  Company: [
    { label: 'About', href: '/#about' },
    { label: 'Healthcare', href: '/#healthcare' },
    { label: 'Privacy', href: '/#privacy' },
  ],
  Support: [
    { label: 'Help Center', href: '#' },
    { label: 'Contact', href: '#' },
    { label: 'Returns', href: '#' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-1">
            <AionLogo size="md" animated={false} />
            <p className="text-body mt-4 max-w-xs">
              The full circle of health. Eternal awareness, everyday wellness.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-medium text-foreground mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-8 border-t border-border">
          <p className="text-caption max-w-3xl mb-6">
            aiOn provides wellness insights based on physiological signal trends and patterns. 
            It is not intended for medical diagnosis or treatment. Always consult a healthcare 
            professional for medical advice.
          </p>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <p className="text-caption">
              © {new Date().getFullYear()} aiOn. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="#" className="text-caption hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link to="#" className="text-caption hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link to="#" className="text-caption hover:text-foreground transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
