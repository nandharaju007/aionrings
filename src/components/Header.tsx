import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { AionLogo } from './AionLogo';

const navLinks = [
  { href: '#how', label: 'How It Works' },
  { href: '#app', label: 'The App' },
  { href: '#ring', label: 'The Ring' },
  { href: '/partners', label: 'Partners', route: true },
  { href: '/preorder', label: 'Pre-Order', route: true },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setOpen(false);
    if (id.startsWith('/')) {
      navigate(id);
      return;
    }
    if (location.pathname !== '/') {
      navigate('/' + id);
      return;
    }
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-[250ms]"
        style={{
          background: scrolled ? 'rgba(10,22,40,0.9)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        }}
      >
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
          <Link to="/" aria-label="aiOn home">
            <AionLogo width={110} />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((l, i) => (
              (l as any).route ? (
                <Link
                  key={i}
                  to={l.href}
                  className="text-[14px] font-medium text-[#B8C5D3] hover:text-white transition-colors"
                >
                  {l.label}
                </Link>
              ) : (
                <button
                  key={i}
                  onClick={() => scrollTo(l.href)}
                  className="text-[14px] font-medium text-[#B8C5D3] hover:text-white transition-colors"
                >
                  {l.label}
                </button>
              )
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/preorder"
              aria-label="Pre-order aiOn Ring"
              className="hidden sm:inline-flex items-center rounded-full px-6 py-2.5 text-[14px] font-semibold text-white transition-all duration-150 hover:brightness-110 hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg,#00C6FF,#4FB3FF,#7C3AED)' }}
            >
              Pre-Order →
            </Link>
            <button
              className="md:hidden text-white p-2"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-[#0A1628] md:hidden">
          {navLinks.map((l, i) => (
            (l as any).route ? (
              <Link key={i} to={l.href} onClick={() => setOpen(false)} className="text-2xl font-medium text-white">
                {l.label}
              </Link>
            ) : (
              <button key={i} onClick={() => scrollTo(l.href)} className="text-2xl font-medium text-white">
                {l.label}
              </button>
            )
          ))}
          <Link
            to="/preorder"
            onClick={() => setOpen(false)}
            className="mt-6 rounded-full px-8 py-4 text-[15px] font-semibold text-white"
            style={{ background: 'linear-gradient(135deg,#00C6FF,#4FB3FF,#7C3AED)' }}
          >
            Pre-Order →
          </Link>
        </div>
      )}
    </>
  );
}
