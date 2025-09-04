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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { GetCategories } from "@/api/_requests/categories";
import { useQuery } from "@tanstack/react-query";
import { GetExtras } from "@/api/_requests/extras";
import { formatPriceWithCurrencyStyle } from "@/lib/utils";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => void;
  isLoading?: boolean;
  initialData?: Partial<ProductFormData>;
  mode?: "add" | "edit";
}

export interface Extra {
  id: number;
  name: string;
  price: number;
}

export interface ProductFormData {
  name: string;
  price: string;
  description: string;
  category: string;
  image?: File;
  extras?: number[]; // Array de IDs dos extras selecionados
}

export default function ProductModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData,
  mode = "add",
}: ProductModalProps) {
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
    control,
    setValue,
    watch,
  } = useForm<ProductFormData>({
    defaultValues: {
      name: initialData?.name || "",
      price: initialData?.price || "",
      description: initialData?.description || "",
      category: initialData?.category || "",
      image: undefined,
      extras: initialData?.extras || [],
    },
  });

  const selectedExtras = watch("extras") || [];

  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => GetCategories(),
    staleTime: 30000,
  });

  const { data: extras, isLoading: isExtrasLoading } = useQuery({
    queryKey: ["extras"],
    queryFn: () => GetExtras(),
    staleTime: 30000,
  });

  useEffect(() => {
    return () => reset();
  }, [initialData, reset]);

  const handleFormSubmit = (data: ProductFormData) => {
    onSubmit(data);
  };

  const handleCloseModal = () => {
    onClose();
    reset();
  };

  const handleExtraChange = (extraId: number, checked: boolean) => {
    const currentExtras = selectedExtras;
    let newExtras;

    if (checked) {
      newExtras = [...currentExtras, extraId];
    } else {
      newExtras = currentExtras.filter((id) => id !== extraId);
    }

    setValue("extras", newExtras);
  };

  const isEditMode = mode === "edit";
  const title = isEditMode ? "Editar Produto" : "Adicionar Novo Produto";
  const description = isEditMode
    ? "Atualize os dados do produto abaixo."
    : "Preencha o formulário abaixo para adicionar um novo produto ao estoque.";
  const submitButtonText = isEditMode
    ? "Salvar Alterações"
    : "Adicionar Produto";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[85vh] overflow-auto pb-0">
        <DialogHeader>
          <DialogTitle className="text-base">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Nome do Produto */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Produto</Label>
            <Input
              id="name"
              type="text"
              placeholder="Digite o nome do produto"
              className={errors.name ? "border-red-500" : ""}
              disabled={isLoading}
              {...register("name", {
                required: "Nome do produto é obrigatório",
                minLength: {
                  value: 2,
                  message: "Nome deve ter pelo menos 2 caracteres",
                },
              })}
            />
            {errors.name && (
              <p className="text-red-500 text-xs">{errors.name.message}</p>
            )}
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Controller
              name="category"
              control={control}
              rules={{
                required: "Categoria é obrigatória",
              }}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isLoading}
                >
                  <SelectTrigger
                    className={
                      errors.category ? "border-red-500 w-full" : "w-full"
                    }
                  >
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {isCategoriesLoading ? (
                        <SelectLabel>
                          <div className="animate-spin rounded-full size-5 border-b-2 border-gray-900 mx-auto" />
                        </SelectLabel>
                      ) : (
                        <>
                          <SelectLabel>Categorias</SelectLabel>
                          {categories &&
                            categories.map((category) => (
                              <SelectItem
                                value={category.id.toString()}
                                key={category.id.toString()}
                              >
                                {category.name}
                              </SelectItem>
                            ))}
                        </>
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && (
              <p className="text-red-500 text-xs">{errors.category.message}</p>
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

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="Digite a descrição do produto"
              disabled={isLoading}
              className={errors.description ? "border-red-500" : ""}
              {...register("description", {
                required: "Descrição é obrigatória",
                maxLength: {
                  value: 500,
                  message: "Descrição deve ter no máximo 500 caracteres",
                },
              })}
            />
            {errors.description && (
              <p className="text-red-500 text-xs">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Extras */}
          <div className="space-y-2">
            <Label>Extras (opcionais)</Label>
            {isExtrasLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
                <span className="ml-2 text-sm text-gray-600">
                  Carregando extras...
                </span>
              </div>
            ) : extras && extras.length > 0 ? (
              <div className="space-y-3 max-h-48 overflow-y-auto border rounded-md p-3 bg-gray-50 border-gray-200">
                {extras.map((extra) => (
                  <div key={extra.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`extra-${extra.id}`}
                      checked={selectedExtras.includes(extra.id)}
                      onCheckedChange={(checked) =>
                        handleExtraChange(extra.id, checked === true)
                      }
                      disabled={isLoading}
                      className="cursor-pointer"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={`extra-${extra.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {extra.name}
                      </label>
                      <p className="text-xs text-gray-600">
                        {formatPriceWithCurrencyStyle(extra.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 py-2">
                Nenhum extra disponível
              </div>
            )}
            {selectedExtras.length > 0 && (
              <p className="text-xs text-blue-600">
                {selectedExtras.length} extra
                {selectedExtras.length > 1 ? "s" : ""} selecionado
                {selectedExtras.length > 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Upload de Imagem */}
          <div className="space-y-2">
            <Label htmlFor="image">
              Imagem
              {isEditMode && (
                <span className="text-xs text-gray-500 ml-1">
                  (deixe vazio para manter a imagem atual)
                </span>
              )}
            </Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              disabled={isLoading}
              onChange={(e) => {
                const file = e.target.files ? e.target.files[0] : undefined;
                setValue("image", file);
              }}
            />
            {errors.image && (
              <p className="text-red-500 text-xs">{errors.image.message}</p>
            )}
          </div>

          <DialogFooter className="sticky bottom-0 w-full pt-4 pb-4 bg-white">
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
