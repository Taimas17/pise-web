import axios from "axios";
import { toast } from "../components/ui/sonner";

export const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname.includes("pise.local") ? "http://api.pise.local" : "http://localhost:8000");

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: { "X-Requested-With": "XMLHttpRequest" },
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      if (window.location.pathname !== "/compte") {
        toast("Session expirée. Veuillez vous reconnecter.");
        window.location.href = "/compte";
      }
    } else if (status === 403) {
      toast("Accès refusé");
    }
    return Promise.reject(error);
  }
);

export async function sanctumCsrf() {
  await axios.get(`${API_URL}/sanctum/csrf-cookie`, { withCredentials: true });
}
