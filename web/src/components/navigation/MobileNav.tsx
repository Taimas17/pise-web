import { Link, NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuthStore } from '@/stores/useAuthStore';

export type NavItem = { to: string; label: string };

export default function MobileNav({ items }: { items: NavItem[] }){
  const user = useAuthStore(s => s.user);
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="touch-target">
          <Menu className="size-5" />
          <span className="sr-only">Ouvrir la navigation</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>
            <Link to="/" className="text-xl font-bold text-sky-600">PISE</Link>
          </SheetTitle>
        </SheetHeader>
        <div className="p-3 border-b flex items-center justify-between">
          <div className="text-sm">
            {user ? <span className="opacity-80">Connecté: <span className="font-medium">{user.name}</span></span> : <span className="opacity-80">Non connecté</span>}
          </div>
          <ThemeToggle variant="switch" />
        </div>
        <nav className="p-2">
          <ul className="grid gap-1">
            {items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `block rounded-sm px-3 py-2 text-base ${
                      isActive ? 'bg-sky-50 text-sky-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
