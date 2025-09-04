import type { PaginationParams } from "@/components/data-table/generic-data-table";
import type { PaginatedDataResponse, StoreSettings, User } from "@/types";
import { apiClient } from "../config";
import type { RegisterFormData } from "@/pages/public/register-form";
import type { UserFormData } from "@/components/users/user-modal";
import type { StoreSettingsFormData } from "@/pages/admin/admin-store-settings";

export async function GetPaginatedUsers(
  paginationParams: PaginationParams
): Promise<PaginatedDataResponse<User>> {
  const response = await apiClient.post<PaginatedDataResponse<User>>(
    "/api/v1/user/paginated",
    paginationParams
  );
  return response.data;
}

export async function CreateUser(form: RegisterFormData): Promise<User> {
  const requestForm = {
    name: form.name,
    cpf: form.cpf,
    email: form.email,
    password: form.password,
  };

  const response = await apiClient.post<User>("/api/v1/user", requestForm);
  return response.data;
}

export async function UpdateUser(data: {
  id: number;
  form: UserFormData;
}): Promise<User> {
  delete data.form.confirmPassword;

  const requestForm = {
    name: data.form.name,
    password: data.form.password,
  };

  const response = await apiClient.put<User>(
    `/api/v1/user/${data.id}`,
    requestForm
  );
  return response.data;
}

export async function DeleteUser(id: number): Promise<void> {
  await apiClient.delete(`/api/v1/user/${id}`);
}

export async function GetUserById(id: number): Promise<User> {
  const response = await apiClient.get<User>(`/api/v1/user/${id}`);
  return response.data;
}

export async function GetStoreSettings(): Promise<StoreSettings> {
  const response = await apiClient.get<StoreSettings>(
    `/api/v1/user/store-settings`
  );
  return response.data;
}

export async function UpdateStoreSettings(
  form: StoreSettingsFormData
): Promise<void> {
  await apiClient.post<StoreSettings>(`/api/v1/user/store-settings`, form);
}
