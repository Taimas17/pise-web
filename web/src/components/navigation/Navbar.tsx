import { Link, NavLink } from 'react-router-dom';
import ThemeToggle from '@/components/ThemeToggle';
import MobileNav, { NavItem } from './MobileNav';
import { useEffect, useRef, useState } from 'react';

export default function Navbar({ items }: { items: NavItem[] }){
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      const delta = y - lastY.current;
      if (Math.abs(delta) > 5) {
        setHidden(delta > 0 && y > 64);
        lastY.current = y;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-20 border-b bg-white/70 dark:bg-black/40 backdrop-blur supports-[backdrop-filter]:bg-white/60 transition-transform duration-300 ${hidden ? '-translate-y-full' : 'translate-y-0'}`}>
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <div className="md:hidden">
          <MobileNav items={items} />
        </div>
        <Link to="/" className="text-responsive-h2 text-sky-600 tracking-tight">PISE</Link>
        <nav className="hidden md:flex items-center gap-5 text-sm ml-4">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `transition-colors ${isActive ? 'text-sky-700 font-medium border-b-2 border-sky-600 pb-0.5' : 'text-gray-600 hover:text-gray-900'}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto">
          <ThemeToggle variant="switch" />
        </div>
      </div>
    </header>
  );
}
