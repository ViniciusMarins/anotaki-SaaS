import type { AddressFormType } from "@/components/addresses/address-modal";
import type { Address } from "@/types";
import { apiClient } from "../config";

export async function CreateAddress(form: AddressFormType): Promise<Address> {
  const response = await apiClient.post<Address>("/api/v1/address", form);
  return response.data;
}

export async function DeleteAddress(id: number): Promise<void> {
  await apiClient.delete<Address>(`/api/v1/address/${id}`);
}
