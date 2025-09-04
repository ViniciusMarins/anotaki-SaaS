import type { CategoryFormData } from "@/components/categories/category-modal";
import type { PaginationParams } from "@/components/data-table/generic-data-table";
import type { Category, PaginatedDataResponse } from "@/types";
import { apiClient } from "../config";

export async function GetCategories(): Promise<Category[]> {
  const response = await apiClient.get<Category[]>("/api/v1/category");
  return response.data;
}

export async function GetPaginatedCategories(
  paginationParams: PaginationParams
): Promise<PaginatedDataResponse<Category>> {
  const response = await apiClient.post<PaginatedDataResponse<Category>>(
    "/api/v1/category/paginated",
    paginationParams
  );
  return response.data;
}

export async function CreateCategory(
  form: CategoryFormData
): Promise<Category> {
  const response = await apiClient.post<Category>("/api/v1/category", form);
  return response.data;
}

export async function UpdateCategory(data: {
  id: number;
  form: CategoryFormData;
}): Promise<Category> {
  const response = await apiClient.put<Category>(
    `/api/v1/category/${data.id}`,
    data.form
  );
  return response.data;
}

export async function DeleteCategory(id: number): Promise<void> {
  await apiClient.delete(`/api/v1/category/${id}`);
}
