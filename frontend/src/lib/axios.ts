import axios from "axios";
import { auth } from "@/lib/firebase";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds timeout
});

// Request Interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      // Always fetch the latest ID token from Firebase
      const currentUser = auth.currentUser;
      if (currentUser) {
        const token = await currentUser.getIdToken(true); // forceRefresh=true ensures validity if needed, but false is usually fine. Using false for performance.
        const cachedToken = await currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${cachedToken}`;
      }
      
      // Request Logging
      if (import.meta.env.DEV) {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data || "");
      }
    } catch (error) {
      console.error("[API Auth Error] Failed to retrieve token", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error) => {
    if (import.meta.env.DEV) {
      console.error(`[API Error]`, error.response?.status, error.response?.data || error.message);
    }

    // Global Error Handling
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Unauthorized - could sign out user or redirect to login
          console.error("Unauthorized request - possible invalid token");
          break;
        case 403:
          console.error("Forbidden - you lack permissions");
          break;
        case 404:
          console.error("Resource not found");
          break;
        case 500:
          console.error("Internal Server Error");
          break;
        default:
          break;
      }
    } else if (error.request) {
      console.error("Network Error - no response received");
    }

    return Promise.reject(error);
  }
);

export default api;
