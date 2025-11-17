import axios, { AxiosError } from "axios";
import { toast } from "../components/ui/sonner";

export const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname.includes("pise.local") ? "http://api.pise.local" : "http://localhost:8000");

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: { "X-Requested-With": "XMLHttpRequest" },
});

export async function sanctumCsrf() {
  await axios.get(`${API_URL}/sanctum/csrf-cookie`, { withCredentials: true });
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 419) {
      try {
        const originalConfig: any = error.config || {};
        if (!originalConfig._retry) {
          originalConfig._retry = true;
          await sanctumCsrf();
          return api.request(originalConfig);
        }
      } catch (_e) { /* ignore retry error */ }
    }

    // If we get a 401 (unauthorized), try refreshing CSRF cookie once and retry the request.
    // This helps when the browser hasn't fetched the CSRF cookie yet and the request is treated as stateless by Sanctum.
    if (status === 401) {
      try {
        const originalConfig: any = error.config || {};
        if (!originalConfig._retry401) {
          originalConfig._retry401 = true;
          await sanctumCsrf();
          return api.request(originalConfig);
        }
      } catch (_e) { /* ignore retry error */ }
    }

    if (status === 401) {
      toast.error("Session expirée, veuillez vous reconnecter");
    } else if (status === 403) {
      toast.error("Accès non autorisé");
    } else if (status === 422) {
      // Validation handled per screen; still show generic if none
      const message = (error.response?.data as any)?.message || "Données invalides";
      toast.error(message);
    } else if (status === 500) {
      toast.error("Erreur serveur, veuillez réessayer plus tard");
    } else if (!error.response) {
      toast.error("Erreur de connexion au serveur");
    }

    return Promise.reject(error);
  }
);
