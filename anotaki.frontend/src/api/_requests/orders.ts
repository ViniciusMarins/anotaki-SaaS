import type { PaginationParams } from "@/components/data-table/generic-data-table";
import type {
  AddProductToOrderDTO,
  CartDTO,
  ChangeProductQuantityDTO,
  CheckoutOrderDTO,
  Order,
  PaginatedDataResponse,
} from "@/types";
import { apiClient } from "../config";

export async function GetPaginatedOrders(
  paginationParams: PaginationParams
): Promise<PaginatedDataResponse<Order>> {
  const response = await apiClient.post<PaginatedDataResponse<Order>>(
    "/api/v1/order/paginated",
    paginationParams
  );

  return response.data;
}

export async function DeleteOrder(id: number): Promise<void> {
  await apiClient.delete(`/api/v1/order/${id}`);
}

export async function ChangeOrderStatus(data: {
  id: number;
  status: number;
}): Promise<void> {
  await apiClient.patch(
    `/api/v1/order/change-status/${data.id}?orderStatus=${data.status}`
  );
}

export async function GetOrderDetails(id: number): Promise<Order> {
  const response = await apiClient.get<Order>(`/api/v1/order/details/${id}`);
  return response.data;
}

export async function GetUserOrders(userId?: number): Promise<Order[]> {
  const response = await apiClient.get<Order[]>(`/api/v1/order/${userId}`);
  return response.data;
}

export async function AddToCart(payload: AddProductToOrderDTO): Promise<void> {
  await apiClient.post("/api/v1/order/cart", payload);
}

export async function ChangeProductQuantity(
  payload: ChangeProductQuantityDTO
): Promise<void> {
  await apiClient.patch("/api/v1/order/cart", payload);
}

export async function GetCart(): Promise<CartDTO> {
  const response = await apiClient.get<CartDTO>("/api/v1/order/cart");

  return response.data;
}

export async function CheckoutOrder(payload: CheckoutOrderDTO): Promise<void> {
  await apiClient.post<void>("/api/v1/order/checkout-order", payload);
}
