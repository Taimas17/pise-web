import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/stores/useUIStore';

export default function ThemeToggle({ variant = 'dropdown' }: { variant?: 'dropdown' | 'switch' }){
  const { theme, setTheme } = useTheme();
  const ui = useUIStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (ui.theme !== theme) setTheme(ui.theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui.theme]);

  if (!mounted) return null;

  if (variant === 'switch') {
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    return (
      <Button variant="ghost" size="icon" aria-label="Basculer le thème" onClick={() => ui.setTheme(isDark ? 'light' : 'dark')} className="transition-transform active:scale-95">
        {isDark ? <Sun className="size-5 rotate-0 scale-100 transition-transform" /> : <Moon className="size-5 rotate-180 scale-100 transition-transform" />}
      </Button>
    );
  }

  return (
    <div className="inline-flex items-center gap-1">
      <Button variant={theme === 'light' ? 'default' : 'outline'} size="icon" aria-label="Thème clair" onClick={() => ui.setTheme('light')}>
        <Sun className="size-4" />
      </Button>
      <Button variant={theme === 'dark' ? 'default' : 'outline'} size="icon" aria-label="Thème sombre" onClick={() => ui.setTheme('dark')}>
        <Moon className="size-4" />
      </Button>
      <Button variant={theme === 'system' ? 'default' : 'outline'} size="icon" aria-label="Thème système" onClick={() => ui.setTheme('system')}>
        <Monitor className="size-4" />
      </Button>
    </div>
  );
}
