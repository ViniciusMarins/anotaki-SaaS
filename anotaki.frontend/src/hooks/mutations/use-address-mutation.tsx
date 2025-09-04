import { CreateAddress, DeleteAddress } from "@/api/_requests/address";
import { useMutation } from "@tanstack/react-query";

export function useCreateAddress() {
  return useMutation({
    mutationFn: CreateAddress,
  });
}
export function useDeleteAddress() {
  return useMutation({
    mutationFn: DeleteAddress,
  });
}
