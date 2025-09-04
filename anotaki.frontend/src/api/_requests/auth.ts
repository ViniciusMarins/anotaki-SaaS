import type { LoginFormData } from "@/pages/public/login-form";
import type { LoggedUser } from "@/types";
import { apiClient } from "../config";

export async function MakeLogin(form: LoginFormData): Promise<LoggedUser> {
  const response = await apiClient.post<LoggedUser>(
    "/api/v1/auth/login",
    form,
    {
      withCredentials: true,
    }
  );
  return response.data;
}

export async function RefreshToken(): Promise<LoggedUser> {
  const response = await apiClient.post<LoggedUser>(
    "/api/v1/auth/refresh-token",
    {},
    {
      withCredentials: true,
    }
  );
  return response.data;
}

export async function Logout(): Promise<void> {
  await apiClient.post(
    "/api/v1/auth/logout",
    {},
    {
      withCredentials: true,
    }
  );
}
