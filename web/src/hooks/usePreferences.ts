import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ThemePref = 'system' | 'light' | 'dark';
export type FontSizePref = 'small' | 'normal' | 'large';
export type DensityPref = 'comfortable' | 'compact';

export type Preferences = {
  theme: ThemePref;
  fontSize: FontSizePref;
  density: DensityPref;
};

type Ctx = Preferences & {
  setTheme: (t: ThemePref) => void;
  setFontSize: (s: FontSizePref) => void;
  setDensity: (d: DensityPref) => void;
};

const DEFAULT_PREFS: Preferences = { theme: 'system', fontSize: 'normal', density: 'comfortable' };

const PrefsContext = createContext<Ctx | null>(null);

function applyTheme(theme: ThemePref){
  const root = document.documentElement;
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
  root.classList.toggle('dark', isDark);
}

function applyFontSize(fontSize: FontSizePref){
  const root = document.documentElement;
  const size = fontSize === 'small' ? '14px' : fontSize === 'large' ? '18px' : '16px';
  root.style.fontSize = size;
}

function applyDensity(density: DensityPref){
  const root = document.documentElement;
  root.setAttribute('data-density', density);
}

export function PreferencesProvider({ children }: { children: React.ReactNode }){
  const [prefs, setPrefs] = useState<Preferences>(() => {
    try { const raw = localStorage.getItem('prefs'); if (raw) return JSON.parse(raw); } catch {}
    return DEFAULT_PREFS;
  });

  useEffect(()=>{
    localStorage.setItem('prefs', JSON.stringify(prefs));
    applyTheme(prefs.theme);
    applyFontSize(prefs.fontSize);
    applyDensity(prefs.density);
  }, [prefs]);

  useEffect(()=>{
    if (prefs.theme !== 'system') return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme('system');
    try { mql.addEventListener('change', onChange); } catch { mql.addListener(onChange); }
    return ()=>{ try { mql.removeEventListener('change', onChange); } catch { mql.removeListener(onChange); } };
  }, [prefs.theme]);

  const value = useMemo<Ctx>(()=> ({
    ...prefs,
    setTheme: (t)=> setPrefs(p=> ({ ...p, theme: t })),
    setFontSize: (s)=> setPrefs(p=> ({ ...p, fontSize: s })),
    setDensity: (d)=> setPrefs(p=> ({ ...p, density: d })),
  }), [prefs]);

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
}

export function usePreferences(){
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider');
  return ctx;
}
