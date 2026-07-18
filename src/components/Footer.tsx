import { Link } from 'react-router-dom';
import { Linkedin, Twitter, Instagram } from 'lucide-react';
import { AionLogo } from './AionLogo';

const productLinks: { label: string; href: string }[] = [
  { label: 'How It Works', href: '/#how' },
  { label: 'The App', href: '/#app' },
  { label: 'The Ring', href: '/#ring' },
  { label: 'Pre-Order', href: '/preorder' },
  { label: 'Size Guide', href: '/preorder' },
];
const companyLinks: { label: string; href: string }[] = [
  { label: 'About', href: '/' },
  { label: 'Support', href: '/support' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms of Service', href: '/terms-of-service' },
  { label: 'Contact', href: 'mailto:support@aionrings.com' },
];

export function Footer() {
  return (
    <footer className="relative bg-[#070E1A] text-[#8B9DAF]">
      <div
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ background: 'linear-gradient(90deg,#00C6FF,#4FB3FF,#7C3AED)' }}
      />
      <div className="mx-auto max-w-[1200px] px-6 pt-16 pb-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[2fr_1fr_1fr]">
          <div>
            <AionLogo width={150} showTagline />
            <p className="mt-3 text-[14px] text-[#5A6B7E]">The Full Circle of Health</p>
            <p className="mt-2 text-[13px] text-[#5A6B7E]">
              aiOn Health Science LLC · A Mazo Solutions Inc company
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[3px] text-[#8B9DAF]">
              Product
            </h4>
            <ul className="space-y-3">
              {productLinks.map((l) => (
                <li key={l.label}>
                  {l.href.startsWith('/') && !l.href.includes('#') ? (
                    <Link to={l.href} className="text-[14px] text-[#8B9DAF] transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  ) : (
                    <a href={l.href} className="text-[14px] text-[#8B9DAF] transition-colors hover:text-white">
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[3px] text-[#8B9DAF]">
              Company
            </h4>
            <ul className="space-y-3">
              {companyLinks.map((l) => (
                <li key={l.label}>
                  {l.href.startsWith('/') ? (
                    <Link
                      to={l.href}
                      className="text-[14px] text-[#8B9DAF] transition-colors hover:text-white"
                    >
                      {l.label}
                    </Link>
                  ) : (
                    <a
                      href={l.href}
                      className="text-[14px] text-[#8B9DAF] transition-colors hover:text-white"
                    >
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#1E3A5F] pt-6 md:flex-row">
          <p className="text-[13px] text-[#5A6B7E]">© 2026 aiOn Health Science LLC</p>
          <div className="flex gap-5 text-[#5A6B7E]">
            <a href="#" aria-label="LinkedIn" className="transition-colors hover:text-[#4FB3FF]">
              <Linkedin className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Twitter" className="transition-colors hover:text-[#4FB3FF]">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Instagram" className="transition-colors hover:text-[#4FB3FF]">
              <Instagram className="h-5 w-5" />
            </a>
          </div>
        </div>

        <p className="mx-auto mt-4 max-w-xl text-center text-[12px] text-[#5A6B7E]">
          aiOn is a consumer wellness ring. Not a medical device. Not intended to diagnose, treat,
          cure, or prevent any disease.
        </p>
        <p className="mx-auto mt-3 max-w-2xl text-center text-[12px] text-[#5A6B7E]">
          Blood Pressure (EST) and Blood Glucose (EST) are estimated readings — not for
          medical diagnosis or clinical use. Consult a qualified healthcare provider.
        </p>
        <p className="mx-auto mt-3 max-w-2xl text-center text-[12px] text-[#5A6B7E]">
          Built by a healthcare technology team with a decade of experience in AI and health systems.
        </p>
      </div>
    </footer>
  );
}
