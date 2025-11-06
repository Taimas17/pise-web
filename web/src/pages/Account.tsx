import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

type Mode = "login" | "register";

type FieldKey = "name" | "email" | "password";

export default function Account() {
  const { user, login, register, logout, loading: authLoading, error: authError } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const clearFieldError = (field: FieldKey) => {
    setErrors((previous) => {
      if (!previous[field]) {
        return previous;
      }
      const { [field]: _removed, ...rest } = previous;
      return rest;
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!email.includes("@")) newErrors.email = "Email invalide";
    if (password.length < 8) newErrors.password = "Minimum 8 caractères";
    if (mode === "register" && !name.trim()) newErrors.name = "Nom requis";
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

  const handleModeChange = (nextMode: Mode) => {
    setMode(nextMode);
    setErrors({});
  };

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
              <Button variant="outline" onClick={() => logout()} disabled={authLoading}>
                {authLoading ? "Déconnexion…" : "Se déconnecter"}
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
        <CardContent className="pt-4 grid gap-3">
          <div className="flex gap-2 text-sm">
            <button
              type="button"
              className={mode === "login" ? "font-semibold" : "text-gray-500"}
              onClick={() => handleModeChange("login")}
            >
              Connexion
            </button>
            <button
              type="button"
              className={mode === "register" ? "font-semibold" : "text-gray-500"}
              onClick={() => handleModeChange("register")}
            >
              Inscription citoyen
            </button>
          </div>
          {mode === "register" && (
            <div>
              <Input
                placeholder="Nom"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  clearFieldError("name");
                }}
              />
              {errors.name && <div className="text-sm text-red-600 mt-1">{errors.name}</div>}
            </div>
          )}
          <div>
            <Input
              placeholder="Email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                clearFieldError("email");
              }}
            />
            {errors.email && <div className="text-sm text-red-600 mt-1">{errors.email}</div>}
          </div>
          <div>
            <Input
              placeholder="Mot de passe"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                clearFieldError("password");
              }}
            />
            {errors.password && <div className="text-sm text-red-600 mt-1">{errors.password}</div>}
          </div>
          {mode === "register" && (
            <Input
              placeholder="Téléphone (optionnel)"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          )}
          {authError && <div className="text-sm text-red-600">{authError}</div>}
          {mode === "login" ? (
            <Button onClick={handleLogin} disabled={isLoading || authLoading} className="touch-target">
              {isLoading || authLoading ? "Connexion…" : "Connexion"}
            </Button>
          ) : (
            <Button onClick={handleRegister} disabled={isLoading || authLoading} className="touch-target">
              {isLoading || authLoading ? "Inscription…" : "Inscription"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
