import { createContext, useContext, useEffect, useState } from "react";
import { api, sanctumCsrf } from "../lib/api";

export type User = { id: number; name: string; email: string; role: 'admin'|'moderator'|'agent'|'citizen' } | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

function useProvideAuth(){
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{ (async()=>{
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch {}
    finally { setLoading(false); }
  })(); },[]);

  async function login(email: string, password: string){
    await sanctumCsrf();
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data);
  }
  async function register(payload: { name: string; email: string; password: string; phone?: string }){
    await sanctumCsrf();
    const { data } = await api.post('/auth/register', payload);
    setUser(data);
  }
  async function logout(){ await api.post('/auth/logout'); setUser(null); }

  return { user, loading, login, register, logout };
}

export function AuthProvider({ children }: { children: React.ReactNode }){
  const value = useProvideAuth();
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(){
  const ctx = useContext(AuthContext);
  return ctx ?? useProvideAuth();
}
