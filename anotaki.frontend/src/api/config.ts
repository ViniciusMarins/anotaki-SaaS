import axios from "axios";
import { z } from "zod";
import { getExternalAuthActions } from "@/context/auth-provider";
import type { ApiResponse, LoggedUser } from "@/types";
// const { getItem, setItem } = useLocalStorage();

export const API_URL = import.meta.env.VITE_API_URL;

// Cria instância do axios
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
  },
});

const refreshClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Request interceptor - adiciona token
apiClient.interceptors.request.use(
  (config) => {
    if (config.headers.Authorization) {
      return config;
    }

    const token = getExternalAuthActions().token?.();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interface para ApiResponse
const ApiResponseSchema = z.object({
  title: z.string(),
  timestamp: z.string(),
  data: z.any().optional(),
});

// Response error interceptor - trata refresh token
apiClient.interceptors.response.use(
  (response) => {
    try {
      const result = ApiResponseSchema.safeParse(response.data);

      if (result.success && result.data.data !== undefined) {
        return { ...response, data: result.data.data };
      }
    } catch {
      return response;
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/api/v1/auth/refresh-token" &&
      originalRequest.url !== "/api/v1/auth/login"
    ) {
      originalRequest._retry = true;

      try {
        const result = await refreshClient.post<ApiResponse<LoggedUser>>(
          "/api/v1/auth/refresh-token",
          {},
          {
            withCredentials: true,
          }
        );

        const newToken = result.data.data?.token || "";

        getExternalAuthActions().setToken?.(newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        getExternalAuthActions().logout?.();

        if (window.location.pathname != "/login")
          window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
