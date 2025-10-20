import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export default function Account(){
  const { user, login, register, logout } = useAuth();
  const [mode, setMode] = useState<'login'|'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  if (user) return (
    <div className="grid gap-2 max-w-md">
      <div className="text-sm text-gray-600">Connecté comme</div>
      <div className="font-medium">{user.name} — {user.role}</div>
      <Button onClick={()=>logout()}>Se déconnecter</Button>
    </div>
  );

  return (
    <div className="grid gap-3 max-w-sm">
      <div className="flex gap-2 text-sm">
        <button className={mode==='login'?"font-semibold":"text-gray-500"} onClick={()=>setMode('login')}>Connexion</button>
        <button className={mode==='register'?"font-semibold":"text-gray-500"} onClick={()=>setMode('register')}>Inscription citoyen</button>
      </div>
      {mode==='register' && <Input placeholder="Nom" value={name} onChange={e=>setName(e.target.value)} />}
      <Input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <Input placeholder="Mot de passe" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      {mode==='register' && <Input placeholder="Téléphone (optionnel)" value={phone} onChange={e=>setPhone(e.target.value)} />}
      {mode==='login' ? <Button onClick={()=>login(email, password)}>Connexion</Button> : <Button onClick={()=>register({ name, email, password, phone })}>Inscription</Button>}
    </div>
  );
}
