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

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => void;
  isLoading?: boolean;
  initialData?: Partial<CategoryFormData>;
  mode?: "add" | "edit";
}

export interface CategoryFormData {
  name: string;
}

export default function CategoryModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData,
  mode = "add",
}: CategoryModalProps) {
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm<CategoryFormData>({
    defaultValues: {
      name: initialData?.name || "",
    },
  });

  useEffect(() => {
    return () => reset();
  }, [initialData, reset]);

  const handleFormSubmit = (data: CategoryFormData) => {
    onSubmit(data);
  };

  const handleCloseModal = () => {
    onClose();
    reset();
  };

  const isEditMode = mode === "edit";
  const title = isEditMode ? "Editar Categoria" : "Adicionar Nova Categoria";
  const description = isEditMode
    ? "Atualize os dados da categoria abaixo."
    : "Preencha o formulário abaixo para adicionar uma nova categoria.";
  const submitButtonText = isEditMode
    ? "Salvar Alterações"
    : "Adicionar Categoria";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-base">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Nome da Categoria */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Categoria</Label>
            <Input
              id="name"
              type="text"
              placeholder="Digite o nome da categoria"
              className={errors.name ? "border-red-500" : ""}
              disabled={isLoading}
              {...register("name", {
                required: "Nome da categoria é obrigatório",
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
