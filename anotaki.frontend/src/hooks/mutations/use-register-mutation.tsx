import { CreateUser } from "@/api/_requests/users";
import { useMutation } from "@tanstack/react-query";

export function useRegister() {
  return useMutation({
    mutationFn: CreateUser,
  });
}
