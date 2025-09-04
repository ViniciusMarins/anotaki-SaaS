import type { PaginationParams } from "@/components/data-table/generic-data-table";
import type { ExtraFormData } from "@/components/extras/extra-modal";
import type { Extra, PaginatedDataResponse } from "@/types";
import { apiClient } from "../config";

export async function GetExtras(): Promise<Extra[]> {
  const response = await apiClient.get<Extra[]>("/api/v1/extra");
  return response.data;
}

export async function GetPaginatedExtras(
  paginationParams: PaginationParams
): Promise<PaginatedDataResponse<Extra>> {
  const response = await apiClient.post<PaginatedDataResponse<Extra>>(
    "/api/v1/extra/paginated",
    paginationParams
  );
  return response.data;
}

export async function CreateExtra(form: ExtraFormData): Promise<Extra> {
  const response = await apiClient.post<Extra>("/api/v1/extra", form);
  return response.data;
}

export async function UpdateExtra(data: {
  id: number;
  form: ExtraFormData;
}): Promise<Extra> {
  const response = await apiClient.put<Extra>(
    `/api/v1/extra/${data.id}`,
    data.form
  );
  return response.data;
}

export async function DeleteExtra(id: number): Promise<void> {
  await apiClient.delete(`/api/v1/extra/${id}`);
}
