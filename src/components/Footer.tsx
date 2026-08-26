import { Link } from 'react-router-dom';
import { Linkedin, Twitter, Instagram } from 'lucide-react';
import { AionLogo } from './AionLogo';

const productLinks: { label: string; href: string }[] = [
  { label: 'How It Works', href: '/#how' },
  { label: 'The App', href: '/app' },
  { label: 'The Ring', href: '/#ring' },
  { label: 'Pre-Order', href: '/preorder' },
  { label: 'Size Guide', href: '/preorder' },
];
const companyLinks: { label: string; href: string }[] = [
  { label: 'About', href: '/' },
  { label: 'Support', href: '/support' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms of Service', href: '/terms-of-service' },
  { label: 'Contact', href: 'mailto:contact@aionrings.com' },
];

export function Footer() {
  return (
    <footer className="relative bg-white text-[#5A6B80] border-t border-border">
      <div
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ background: 'linear-gradient(90deg,#00A9E0,#1878E0,#6D28D9)' }}
      />
      <div className="mx-auto max-w-[1200px] px-6 pt-16 pb-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[2fr_1fr_1fr]">
          <div>
            <AionLogo width={150} showTagline />
            <p className="mt-3 text-[14px] text-[#6B7A8C]">The Full Circle of Health</p>
            <p className="mt-2 text-[13px] text-[#6B7A8C]">
              aiOn Health Science LLC · A Mazo Solutions Inc company
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[3px] text-[#5A6B80]">
              Product
            </h4>
            <ul className="space-y-3">
              {productLinks.map((l) => (
                <li key={l.label}>
                  {l.href.startsWith('/') && !l.href.includes('#') ? (
                    <Link to={l.href} className="text-[14px] text-[#5A6B80] transition-colors hover:text-ink">
                      {l.label}
                    </Link>
                  ) : (
                    <a href={l.href} className="text-[14px] text-[#5A6B80] transition-colors hover:text-ink">
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[3px] text-[#5A6B80]">
              Company
            </h4>
            <ul className="space-y-3">
              {companyLinks.map((l) => (
                <li key={l.label}>
                  {l.href.startsWith('/') ? (
                    <Link
                      to={l.href}
                      className="text-[14px] text-[#5A6B80] transition-colors hover:text-ink"
                    >
                      {l.label}
                    </Link>
                  ) : (
                    <a
                      href={l.href}
                      className="text-[14px] text-[#5A6B80] transition-colors hover:text-ink"
                    >
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 md:flex-row">
          <p className="text-[13px] text-[#6B7A8C]">© 2026 aiOn Health Science LLC</p>
          <div className="flex gap-5 text-[#6B7A8C]">
            <a href="#" aria-label="LinkedIn" className="transition-colors hover:text-[#1878E0]">
              <Linkedin className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Twitter" className="transition-colors hover:text-[#1878E0]">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Instagram" className="transition-colors hover:text-[#1878E0]">
              <Instagram className="h-5 w-5" />
            </a>
          </div>
        </div>

        <p className="mx-auto mt-4 max-w-2xl text-center text-[12px] text-[#6B7A8C]">
          aiOn Ring is intended for general wellness purposes only and is not a medical device.
        </p>
        <p className="mx-auto mt-3 max-w-2xl text-center text-[12px] text-[#6B7A8C]">
          The information provided by aiOn Ring is for informational purposes only and is not
          intended to diagnose, treat, cure, or prevent any disease or medical condition.
        </p>
        <p className="mx-auto mt-3 max-w-2xl text-center text-[12px] text-[#6B7A8C]">
          Always consult a qualified healthcare professional regarding any medical concerns or
          before making healthcare decisions.
        </p>
        <p className="mx-auto mt-3 max-w-2xl text-center text-[12px] text-[#6B7A8C]">
          Blood Pressure (EST) and Blood Glucose (EST) are non-medical wellness estimates showing
          general trends only — they are not measurements and must not be used for any health or
          treatment decision.
        </p>
      </div>
    </footer>
  );
}
