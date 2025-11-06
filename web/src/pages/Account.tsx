import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, registerSchema } from "@/lib/validation/auth.schemas";
import { useLogin, useMe, useRegister, useLogout } from "@/hooks/api/useAuth";
import { useAuthStore } from "@/stores/useAuthStore";

export default function Account() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const { data: me } = useMe();
  const user = useAuthStore(s => s.user);
  const { mutate: doLogin, isPending: loginPending } = useLogin();
  const { mutate: doRegister, isPending: registerPending } = useRegister();
  const { mutate: doLogout, isPending: logoutPending } = useLogout();

  useEffect(() => { /* ensures store sync via useMe */ }, []);

  if (user) {
    return (
      <div className="max-w-xl grid gap-4">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Mon compte</CardTitle>
            <CardDescription>Informations du profil</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-semibold">
                {(user.name || user.email || "U").slice(0, 1).toUpperCase()}
              </div>
              <div>
                <div className="font-medium">{user.name} — {user.role}</div>
                <div className="text-sm text-gray-600">{user.email}</div>
              </div>
            </div>
            <div className="mt-4">
              <Button variant="outline" onClick={() => doLogout()} disabled={logoutPending}>
                {logoutPending ? "Déconnexion…" : "Se déconnecter"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md">
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Compte</CardTitle>
          <CardDescription>Connexion ou inscription citoyen</CardDescription>
        </CardHeader>
        <CardContent className="pt-4 grid gap-4">
          <div className="flex gap-2 text-sm">
            <button type="button" className={mode === "login" ? "font-semibold" : "text-gray-500"} onClick={() => setMode("login")}>Connexion</button>
            <button type="button" className={mode === "register" ? "font-semibold" : "text-gray-500"} onClick={() => setMode("register")}>Inscription citoyen</button>
          </div>
          {mode === 'login' ? <LoginForm onSubmit={(v) => doLogin(v)} loading={loginPending} /> : <RegisterForm onSubmit={(v) => doRegister(v)} loading={registerPending} />}
        </CardContent>
      </Card>
    </div>
  );
}

function LoginForm({ onSubmit, loading }: { onSubmit: (v: z.infer<typeof loginSchema>) => void; loading?: boolean }){
  const form = useForm<z.infer<typeof loginSchema>>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });
  return (
    <form className="grid gap-3" onSubmit={form.handleSubmit(onSubmit)}>
      <div>
        <Input placeholder="Email" {...form.register('email')} />
        {form.formState.errors.email && <div className="text-sm text-red-600 mt-1">{form.formState.errors.email.message}</div>}
      </div>
      <div>
        <Input placeholder="Mot de passe" type="password" {...form.register('password')} />
        {form.formState.errors.password && <div className="text-sm text-red-600 mt-1">{form.formState.errors.password.message}</div>}
      </div>
      <Button type="submit" disabled={loading} className="touch-target">{loading ? 'Connexion…' : 'Connexion'}</Button>
    </form>
  );
}

function RegisterForm({ onSubmit, loading }: { onSubmit: (v: z.infer<typeof registerSchema>) => void; loading?: boolean }){
  const form = useForm<z.infer<typeof registerSchema>>({ resolver: zodResolver(registerSchema), defaultValues: { name: '', email: '', password: '', phone: '' } });
  return (
    <form className="grid gap-3" onSubmit={form.handleSubmit(onSubmit)}>
      <div>
        <Input placeholder="Nom" {...form.register('name')} />
        {form.formState.errors.name && <div className="text-sm text-red-600 mt-1">{form.formState.errors.name.message}</div>}
      </div>
      <div>
        <Input placeholder="Email" {...form.register('email')} />
        {form.formState.errors.email && <div className="text-sm text-red-600 mt-1">{form.formState.errors.email.message}</div>}
      </div>
      <div>
        <Input placeholder="Mot de passe" type="password" {...form.register('password')} />
        {form.formState.errors.password && <div className="text-sm text-red-600 mt-1">{form.formState.errors.password.message}</div>}
      </div>
      <Input placeholder="Téléphone (optionnel)" {...form.register('phone')} />
      <Button type="submit" disabled={loading} className="touch-target">{loading ? 'Inscription…' : 'Inscription'}</Button>
    </form>
  );
}
