import {
  AddToCart,
  ChangeProductQuantity,
  CheckoutOrder,
} from "@/api/_requests/orders";
import { useMutation } from "@tanstack/react-query";

export function useAddToCart() {
  return useMutation({
    mutationFn: AddToCart,
  });
}
export function useChangeProductCartQuantity() {
  return useMutation({
    mutationFn: ChangeProductQuantity,
  });
}
export function useOrderCheckout() {
  return useMutation({
    mutationFn: CheckoutOrder,
  });
}
