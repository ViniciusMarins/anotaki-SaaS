import { Controller, useForm } from "react-hook-form";
import { useEffect } from "react";
import { NumericFormat } from "react-number-format";
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

interface ExtraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExtraFormData) => void;
  isLoading?: boolean;
  initialData?: Partial<ExtraFormData>;
  mode?: "add" | "edit";
}

export interface ExtraFormData {
  name: string;
  price: string;
}

export default function ExtraModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData,
  mode = "add",
}: ExtraModalProps) {
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
    control,
  } = useForm<ExtraFormData>({
    defaultValues: {
      name: initialData?.name || "",
      price: initialData?.price || "",
    },
  });

  useEffect(() => {
    return () => reset();
  }, [initialData, reset]);

  const handleFormSubmit = (data: ExtraFormData) => {
    onSubmit(data);
  };

  const handleCloseModal = () => {
    onClose();
    reset();
  };

  const isEditMode = mode === "edit";
  const title = isEditMode ? "Editar Extra" : "Adicionar Novo Extra";
  const description = isEditMode
    ? "Atualize os dados do extra abaixo."
    : "Preencha o formulário abaixo para adicionar um novo extra.";
  const submitButtonText = isEditMode ? "Salvar Alterações" : "Adicionar Extra";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-base">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Nome do Extra */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Extra</Label>
            <Input
              id="name"
              type="text"
              placeholder="Digite o nome do extra"
              className={errors.name ? "border-red-500" : ""}
              disabled={isLoading}
              {...register("name", {
                required: "Nome do extra é obrigatório",
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

          {/* Preço */}
          <div className="space-y-2">
            <Label htmlFor="price">Preço</Label>
            <Controller
              name="price"
              control={control}
              rules={{
                required: "Preço é obrigatório",
                validate: (value) => {
                  const num = parseFloat(value);
                  return num > 0 || "Preço deve ser maior que zero";
                },
              }}
              render={({ field }) => (
                <NumericFormat
                  customInput={Input}
                  value={field.value}
                  onValueChange={(values) => {
                    field.onChange(values.value);
                  }}
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="R$ "
                  decimalScale={2}
                  fixedDecimalScale={true}
                  allowNegative={false}
                  placeholder="R$ 0,00"
                  disabled={isLoading}
                  className={errors.price ? "border-red-500" : ""}
                />
              )}
            />
            {errors.price && (
              <p className="text-red-500 text-xs">{errors.price.message}</p>
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
