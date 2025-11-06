import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export default function Account(){
  const { user, login, register, logout, loading: authLoading, error: authError } = useAuth();
  const [mode, setMode] = useState<'login'|'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!email.includes('@')) newErrors.email = 'Email invalide';
    if (password.length < 8) newErrors.password = 'Minimum 8 caractères';
    if (mode === 'register' && !name.trim()) newErrors.name = 'Nom requis';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await login(email, password);
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await register({ name, email, password, phone });
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  if (user) return (
    <div className="grid gap-2 max-w-md">
      <div className="text-sm text-gray-600">Connecté comme</div>
      <div className="font-medium">{user.name} — {user.role}</div>
      <Button onClick={()=>logout()} disabled={authLoading}> {authLoading ? 'Déconnexion…' : 'Se déconnecter'} </Button>
    </div>
  );

  return (
    <div className="grid gap-3 max-w-sm">
      <div className="flex gap-2 text-sm">
        <button className={mode==='login'?"font-semibold":"text-gray-500"} onClick={()=>setMode('login')}>Connexion</button>
        <button className={mode==='register'?"font-semibold":"text-gray-500"} onClick={()=>setMode('register')}>Inscription citoyen</button>
      </div>
      {mode==='register' && (
        <div>
          <Input placeholder="Nom" value={name} onChange={e=>{setName(e.target.value); setErrors(prev=>({ ...prev, name: '' }))}} />
          {errors.name && <div className="text-sm text-red-600 mt-1">{errors.name}</div>}
        </div>
      )}
      <div>
        <Input placeholder="Email" value={email} onChange={e=>{setEmail(e.target.value); setErrors(prev=>({ ...prev, email: '' }))}} />
        {errors.email && <div className="text-sm text-red-600 mt-1">{errors.email}</div>}
      </div>
      <div>
        <Input placeholder="Mot de passe" type="password" value={password} onChange={e=>{setPassword(e.target.value); setErrors(prev=>({ ...prev, password: '' }))}} />
        {errors.password && <div className="text-sm text-red-600 mt-1">{errors.password}</div>}
      </div>
      {mode==='register' && <Input placeholder="Téléphone (optionnel)" value={phone} onChange={e=>setPhone(e.target.value)} />}
      {authError && <div className="text-sm text-red-600">{authError}</div>}
      {mode==='login' ? (
        <Button onClick={handleLogin} disabled={isLoading || authLoading}>
          {isLoading || authLoading ? 'Connexion…' : 'Connexion'}
        </Button>
      ) : (
        <Button onClick={handleRegister} disabled={isLoading || authLoading}>
          {isLoading || authLoading ? 'Inscription…' : 'Inscription'}
        </Button>
      )}
    </div>
  );
}
