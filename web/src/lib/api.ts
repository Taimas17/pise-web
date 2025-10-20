import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname.includes("pise.local") ? "http://api.pise.local" : "http://localhost:8000");

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: { "X-Requested-With": "XMLHttpRequest" },
});

export async function sanctumCsrf() {
  await axios.get(`${API_URL}/sanctum/csrf-cookie`, { withCredentials: true });
}
