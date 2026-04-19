import { useEffect, useState } from 'react';
import ThemeToggle from './ThemeToggle';

const links = [
  { href: '#books', label: 'Books' },
  { href: '#experiences', label: 'Experiences' },
  { href: '#goals', label: 'Goals' },
  { href: '#values', label: 'Values' },
  { href: '#interests', label: 'Interests' },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (!el) return;
    const navH = 64;
    const gap = 40;
    const title = el.querySelector('.section-title') ?? el;
    const y = title.getBoundingClientRect().top + window.scrollY - navH - gap;
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  };

  return (
    <>
      <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-inner">
          <a href="#hero" className="nav-logo" onClick={(e) => scrollTo(e, '#hero')}>dp</a>
          <div className="nav-links">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={(e) => scrollTo(e, l.href)}>{l.label}</a>
            ))}
          </div>
          <ThemeToggle />
          <button
            className={`nav-toggle${menuOpen ? ' active' : ''}`}
            aria-label="Menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span /><span />
          </button>
        </div>
      </nav>

      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        {links.map((l) => (
          <a key={l.href} href={l.href} onClick={(e) => { scrollTo(e, l.href); setMenuOpen(false); }}>
            {l.label}
          </a>
        ))}
      </div>
    </>
  );
}
