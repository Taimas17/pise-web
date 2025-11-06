import { useEffect, useState } from "react";
import { api, sanctumCsrf } from "../lib/api";
import { toast } from "../components/ui/sonner";

export type User = { id: number; name: string; email: string; role: 'admin'|'moderator'|'agent'|'citizen' } | null;

export function useAuth(){
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(()=>{ (async()=>{
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch (err) {
      console.debug('Utilisateur non authentifié');
    } finally {
      setLoading(false);
    }
  })(); },[]);

  async function login(email: string, password: string){
    setError(null);
    setLoading(true);
    try {
      await sanctumCsrf();
      const { data } = await api.post('/auth/login', { email, password });
      setUser(data);
      toast.success('Connexion réussie');
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Erreur de connexion';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function register(payload: { name: string; email: string; password: string; phone?: string }){
    setError(null);
    setLoading(true);
    try {
      await sanctumCsrf();
      const { data } = await api.post('/auth/register', payload);
      setUser(data);
      toast.success('Inscription réussie');
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Erreur lors de l\'inscription';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function logout(){
    setError(null);
    setLoading(true);
    try {
      await api.post('/auth/logout');
      setUser(null);
      toast.success('Déconnecté');
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Erreur de déconnexion';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { user, loading, error, login, register, logout };
}
