import { useForm } from "react-hook-form";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PaymentMethodFormData) => void;
  isLoading?: boolean;
  initialData?: Partial<PaymentMethodFormData>;
  mode?: "add" | "edit";
}

export interface PaymentMethodFormData {
  name: string;
}

export default function PaymentMethodModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData,
  mode = "add",
}: PaymentMethodModalProps) {
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm<PaymentMethodFormData>({
    defaultValues: {
      name: initialData?.name || "",
    },
  });

  useEffect(() => {
    return () => reset();
  }, [initialData, reset]);

  const handleFormSubmit = (data: PaymentMethodFormData) => {
    onSubmit(data);
  };

  const handleCloseModal = () => {
    onClose();
    reset();
  };

  const isEditMode = mode === "edit";
  const title = isEditMode
    ? "Editar Método de Pagamento"
    : "Adicionar Novo Método de Pagamento";
  const description = isEditMode
    ? "Atualize os dados do método de pagamento abaixo."
    : "Preencha o formulário abaixo para adicionar um novo método de pagamento.";
  const submitButtonText = isEditMode
    ? "Salvar Alterações"
    : "Adicionar Método";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-base">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Nome do Método de Pagamento */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Método de Pagamento</Label>
            <Input
              id="name"
              type="text"
              placeholder="Digite o nome do método de pagamento"
              className={errors.name ? "border-red-500" : ""}
              disabled={isLoading}
              {...register("name", {
                required: "Nome do método de pagamento é obrigatório",
                minLength: {
                  value: 2,
                  message: "Nome deve ter pelo menos 2 caracteres",
                },
                maxLength: {
                  value: 100,
                  message: "Nome deve ter no máximo 100 caracteres",
                },
              })}
            />
            {errors.name && (
              <p className="text-red-500 text-xs">{errors.name.message}</p>
            )}
          </div>

          <DialogFooter>
            {/* Botões de Ação */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className={
                  isEditMode
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{isEditMode ? "Salvando..." : "Adicionando..."}</span>
                  </div>
                ) : (
                  submitButtonText
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
