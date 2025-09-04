import { MapPin, Plus } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { formatZipCode } from "@/lib/utils";
import { useAuth } from "@/context/use-auth";
import { useCreateAddress } from "@/hooks/mutations/use-address-mutation";
import { customToast } from "../global/toast";

const addressFormSchema = z.object({
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(1, "Estado é obrigatório"),
  zipCode: z
    .string()
    .min(1, "CEP é obrigatório")
    .regex(/^\d{5}-?\d{3}$/, "CEP deve estar no formato 00000-000"),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  street: z.string().min(1, "Rua é obrigatória"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
});

export type AddressFormType = z.infer<typeof addressFormSchema>;

interface AddressModalProps {
  width: number;
}

export default function AddressModal({ width }: AddressModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddressFormType>({
    resolver: zodResolver(addressFormSchema),
  });
  const { user, setUser } = useAuth();
  const createAddressMutation = useCreateAddress();

  const handleFormSubmit = async (data: AddressFormType) => {
    await createAddressMutation.mutateAsync(data, {
      onSuccess: (address) => {
        if (user) {
          setUser({ ...user!, addresses: [...user!.addresses, address] });
          customToast.success("Endereço adicionado com sucesso!");

          reset();
        }
      },
    });
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="ghost" size="sm" className="cursor-pointer">
          <Plus className="h-4 w-4 md:mr-2" />
          {width >= 768 && "Adicionar"}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastre um endereço</DialogTitle>
          <DialogDescription>
            Preencha os dados para cadastrar um novo endereço
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="grid grid-cols-1 gap-4">
            {/* CEP */}
            <div className="space-y-2">
              <Label htmlFor="zipCode">CEP</Label>
              <Input
                id="zipCode"
                type="text"
                maxLength={9}
                placeholder="00000-000"
                className={errors.zipCode ? "border-red-500" : ""}
                // disabled={updateStoreSettingsMutation.isPending}
                {...register("zipCode")}
                onChange={(e) => {
                  e.target.value = formatZipCode(e.target.value);
                }}
              />
              {errors.zipCode && (
                <p className="text-red-500 text-xs">{errors.zipCode.message}</p>
              )}
            </div>

            {/* Cidade */}
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                type="text"
                placeholder="Digite a cidade"
                className={errors.city ? "border-red-500" : ""}
                // disabled={isStoreSettingsLoading}
                {...register("city")}
              />
              {errors.city && (
                <p className="text-red-500 text-xs">{errors.city.message}</p>
              )}
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                type="text"
                placeholder="Digite o estado"
                className={errors.state ? "border-red-500" : ""}
                // disabled={isStoreSettingsLoading}
                {...register("state")}
              />
              {errors.state && (
                <p className="text-red-500 text-xs">{errors.state.message}</p>
              )}
            </div>

            {/* Bairro */}
            <div className="space-y-2">
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input
                id="neighborhood"
                type="text"
                placeholder="Digite o bairro"
                className={errors.neighborhood ? "border-red-500" : ""}
                // disabled={isStoreSettingsLoading}
                {...register("neighborhood")}
              />
              {errors.neighborhood && (
                <p className="text-red-500 text-xs">
                  {errors.neighborhood.message}
                </p>
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              {/* Rua */}
              <div className="flex-1 flex flex-col gap-2">
                <Label htmlFor="street">Rua</Label>
                <Input
                  id="street"
                  type="text"
                  placeholder="Digite o nome da rua"
                  className={errors.street ? "border-red-500" : ""}
                  // disabled={isStoreSettingsLoading}
                  {...register("street")}
                />
                {errors.street && (
                  <p className="text-red-500 text-xs">
                    {errors.street.message}
                  </p>
                )}
              </div>

              {/* Número */}
              <div className="flex-1 flex flex-col gap-2">
                <Label htmlFor="number">Número</Label>
                <Input
                  id="number"
                  type="text"
                  placeholder="123"
                  className={errors.number ? "border-red-500" : ""}
                  // disabled={isStoreSettingsLoading}
                  {...register("number")}
                />
                {errors.number && (
                  <p className="text-red-500 text-xs">
                    {errors.number.message}
                  </p>
                )}
              </div>
            </div>

            {/* Complemento */}
            <div className="space-y-2">
              <Label htmlFor="complement">Complemento (opcional)</Label>
              <Input
                id="complement"
                type="text"
                placeholder="Apartamento, sala, andar..."
                className={errors.complement ? "border-red-500" : ""}
                // disabled={isStoreSettingsLoading}
                {...register("complement")}
              />
              {errors.complement && (
                <p className="text-red-500 text-xs">
                  {errors.complement.message}
                </p>
              )}
            </div>

            <Button type="submit">Enviar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
