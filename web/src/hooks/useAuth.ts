import { useEffect, useState } from "react";
import { api, sanctumCsrf } from "../lib/api";
import type { User as ApiUser } from "../types/api";

export function useAuth(){
  const [user, setUser] = useState<ApiUser | null>(null);
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
