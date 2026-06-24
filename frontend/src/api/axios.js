import axios from "axios";

// If running on localhost, use local backend; otherwise use production URL
const isDevelopment = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const baseURL = isDevelopment 
  ? "http://localhost:3200/api"
  : (import.meta.env.VITE_API_URL || "https://your-production-url.com/api");

console.log(`📡 API Mode: ${isDevelopment ? "DEVELOPMENT (localhost)" : "PRODUCTION"}`);
console.log(`📡 API Base URL: ${baseURL}`);

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;