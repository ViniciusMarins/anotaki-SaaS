import type { PaginationParams } from "@/components/data-table/generic-data-table";
import type { PaymentMethodFormData } from "@/components/payment-methods/payment-method-modal";
import type { PaginatedDataResponse, PaymentMethod } from "@/types";
import { apiClient } from "../config";

export async function GetPaymentMethods(): Promise<PaymentMethod[]> {
  const response = await apiClient.get<PaymentMethod[]>(
    "/api/v1/payment-method"
  );
  return response.data;
}

export async function GetPaginatedPaymentMethods(
  paginationParams: PaginationParams
): Promise<PaginatedDataResponse<PaymentMethod>> {
  const response = await apiClient.post<PaginatedDataResponse<PaymentMethod>>(
    "/api/v1/payment-method/paginated",
    paginationParams
  );
  return response.data;
}

export async function CreatePaymentMethod(
  form: PaymentMethodFormData
): Promise<PaymentMethod> {
  const response = await apiClient.post<PaymentMethod>(
    "/api/v1/payment-method",
    form
  );
  return response.data;
}

export async function UpdatePaymentMethod(data: {
  id: number;
  form: PaymentMethodFormData;
}): Promise<PaymentMethod> {
  const response = await apiClient.put<PaymentMethod>(
    `/api/v1/payment-method/${data.id}`,
    data.form
  );
  return response.data;
}

export async function DeletePaymentMethod(id: number): Promise<void> {
  await apiClient.delete(`/api/v1/payment-method/${id}`);
}
