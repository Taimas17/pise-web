import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

export default function Account(){
  const { user, login, register, logout } = useAuth();
  const [mode, setMode] = useState<'login'|'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  if (user) return (
    <div className="max-w-xl grid gap-4">
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Mon compte</CardTitle>
          <CardDescription>Informations du profil</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-semibold">
              {(user.name||user.email||'U').slice(0,1).toUpperCase()}
            </div>
            <div>
              <div className="font-medium">{user.name} — {user.role}</div>
              <div className="text-sm text-gray-600">{user.email}</div>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="outline" onClick={()=>logout()}>Se déconnecter</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-md">
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Compte</CardTitle>
          <CardDescription>Connexion ou inscription citoyen</CardDescription>
        </CardHeader>
        <CardContent className="pt-4 grid gap-3">
          <div className="flex gap-2 text-sm">
            <button className={mode==='login'?"font-semibold":"text-gray-500"} onClick={()=>setMode('login')}>Connexion</button>
            <button className={mode==='register'?"font-semibold":"text-gray-500"} onClick={()=>setMode('register')}>Inscription citoyen</button>
          </div>
          {mode==='register' && <Input placeholder="Nom" value={name} onChange={e=>setName(e.target.value)} />}
          <Input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <Input placeholder="Mot de passe" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          {mode==='register' && <Input placeholder="Téléphone (optionnel)" value={phone} onChange={e=>setPhone(e.target.value)} />}
          {mode==='login' ? (
            <Button onClick={()=>login(email, password)} className="touch-target">Connexion</Button>
          ) : (
            <Button onClick={()=>register({ name, email, password, phone })} className="touch-target">Inscription</Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}