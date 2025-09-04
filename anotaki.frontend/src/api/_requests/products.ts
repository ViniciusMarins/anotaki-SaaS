import type { PaginationParams } from "@/components/data-table/generic-data-table";
import type { ProductFormData } from "@/components/products/product-modal";
import type {
  PaginatedDataResponse,
  Product,
  ProductsByCategory,
} from "@/types";
import { apiClient } from "../config";

export async function GetPaginatedProducts(
  paginationParams: PaginationParams
): Promise<PaginatedDataResponse<Product>> {
  const response = await apiClient.post<PaginatedDataResponse<Product>>(
    "/api/v1/product/paginated",
    paginationParams
  );
  return response.data;
}

export async function CreateProduct(form: ProductFormData): Promise<Product> {
  const formData = new FormData();

  if (form.image) formData.append("image", form.image);

  formData.append("categoryId", form.category);
  formData.append("description", form.description);
  formData.append("name", form.name);
  formData.append("price", form.price);

  if (form.extras && form.extras.length > 0) {
    formData.append("extras", JSON.stringify(form.extras));
  }

  const response = await apiClient.post<Product>("/api/v1/product", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function UpdateProduct(data: {
  id: number;
  form: ProductFormData;
}): Promise<Product> {
  const formData = new FormData();

  if (data.form.image) {
    formData.append("image", data.form.image);
  }

  formData.append("name", data.form.name);
  formData.append("description", data.form.description);
  formData.append("price", data.form.price.toString());
  formData.append("categoryId", data.form.category.toString());

  if (data.form.extras && data.form.extras.length > 0) {
    formData.append("extras", JSON.stringify(data.form.extras));
  }

  const response = await apiClient.put<Product>(
    `/api/v1/product/${data.id}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
}

export async function DeleteProduct(id: number): Promise<void> {
  await apiClient.delete(`/api/v1/product/${id}`);
}

export async function ToggleProductStatus(id: number): Promise<void> {
  await apiClient.patch(`/api/v1/product/${id}`);
}

export async function GetProductById(id: number): Promise<Product> {
  const response = await apiClient.get<Product>(`/api/v1/product/${id}`);
  return response.data;
}

export async function GetMenu(
  searchTerm: string
): Promise<ProductsByCategory[]> {
  const response = await apiClient.get<ProductsByCategory[]>(
    `/api/v1/product/menu?searchTerm=${searchTerm}`
  );
  return response.data;
}
