import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Check, Eye, EyeOff } from "lucide-react";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => void;
  isLoading?: boolean;
  initialData?: Partial<UserFormData>;
  mode?: "add" | "edit";
}

const checkPasswordRequirements = (password: string) => {
  return {
    minLength: password.length >= 8,
    hasLetter: /[a-zA-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };
};

const userSchema = z
  .object({
    name: z
      .string()
      .min(1, "Nome é obrigatório")
      .min(2, "Nome deve ter pelo menos 2 caracteres")
      .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras"),
    email: z.string(),
    cpf: z.string(),
    password: z
      .string()
      .optional()
      .refine((password) => {
        if (!password) return true; // Senha opcional no modo de edição
        return password.length >= 8;
      }, "Senha deve ter pelo menos 8 caracteres")
      .refine((password) => {
        if (!password) return true;
        return /[a-zA-Z]/.test(password);
      }, "Senha deve conter pelo menos uma letra")
      .refine((password) => {
        if (!password) return true;
        return /[0-9]/.test(password);
      }, "Senha deve conter pelo menos um número"),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.password && data.confirmPassword) {
        return data.password === data.confirmPassword;
      }
      if (data.password && !data.confirmPassword) {
        return false;
      }
      return true;
    },
    {
      message: "As senhas não coincidem",
      path: ["confirmPassword"],
    }
  )
  .refine(
    (data) => {
      if (data.password) {
        return (
          data.confirmPassword !== undefined && data.confirmPassword !== ""
        );
      }
      return true;
    },
    {
      message: "Confirmação de senha é obrigatória quando senha é preenchida",
      path: ["confirmPassword"],
    }
  );

export type UserFormData = z.infer<typeof userSchema>;

export default function UserModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData,
  mode = "add",
}: UserModalProps) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      cpf: initialData?.cpf || "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");
  const passwordRequirements = checkPasswordRequirements(password || "");

  useEffect(() => {
    if (initialData) {
      setValue("name", initialData.name || "");
      setValue("email", initialData.email || "");
      setValue("cpf", initialData.cpf || "");
      setValue("password", "");
      setValue("confirmPassword", "");
    }
  }, [initialData, setValue]);

  useEffect(() => {
    return () => reset();
  }, [initialData, reset]);

  const handleFormSubmit = (data: UserFormData) => {
    const submitData = { ...data };
    if (!submitData.password) {
      delete submitData.password;
      delete submitData.confirmPassword;
    }

    onSubmit(submitData);
  };

  const handleCloseModal = () => {
    onClose();
    reset();
  };

  const isEditMode = mode === "edit";
  const title = isEditMode ? "Editar Usuário" : "Adicionar Novo Usuário";
  const description = isEditMode
    ? "Atualize os dados do usuário abaixo."
    : "Preencha o formulário abaixo para adicionar um novo usuário.";
  const submitButtonText = isEditMode
    ? "Salvar Alterações"
    : "Adicionar Usuário";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[85vh] overflow-auto pb-0">
        <DialogHeader>
          <DialogTitle className="text-base">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input
              id="name"
              type="text"
              placeholder="Digite o nome completo"
              className={errors.name ? "border-red-500" : ""}
              disabled={isLoading}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-red-500 text-xs">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Digite o email"
              className={errors.email ? "border-red-500" : ""}
              disabled={true}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-500 text-xs">{errors.email.message}</p>
            )}
          </div>

          {/* CPF */}
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              type="text"
              maxLength={14}
              placeholder="000.000.000-00"
              className={errors.cpf ? "border-red-500" : ""}
              disabled={true}
              {...register("cpf")}
            />
            {errors.cpf && (
              <p className="text-red-500 text-xs">{errors.cpf.message}</p>
            )}
          </div>

          {/* Senha */}
          <div className="space-y-2">
            <Label htmlFor="password">
              Senha
              {isEditMode && (
                <span className="text-xs text-gray-500 ml-1">
                  (deixe vazio para manter a senha atual)
                </span>
              )}
            </Label>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder={
                isEditMode ? "Nova senha (opcional)" : "Digite a senha"
              }
              className={errors.password ? "border-red-500" : ""}
              disabled={isLoading}
              {...register("password")}
              Icon={showPassword ? EyeOff : Eye}
              iconOnClick={() => setShowPassword(!showPassword)}
              iconPosition="right"
            />

            {password && (
              <div className="mt-2">
                <p className="text-sm text-gray-700 mb-1">A senha deve:</p>
                <ul className="text-xs space-y-1">
                  {[
                    { key: "minLength", text: "Ter pelo menos 8 caracteres" },
                    { key: "hasLetter", text: "Conter pelo menos uma letra" },
                    { key: "hasNumber", text: "Conter pelo menos um número" },
                  ].map(({ key, text }) => {
                    const isValid =
                      passwordRequirements[
                        key as keyof typeof passwordRequirements
                      ];
                    return (
                      <li
                        key={key}
                        className={`flex items-center ${
                          isValid ? "text-green-600" : "text-gray-500"
                        }`}
                      >
                        <Check
                          className={`w-3 h-3 mr-2 ${
                            isValid ? "text-green-600" : "text-gray-400"
                          }`}
                        />
                        {text}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {errors.password && (
              <p className="text-red-500 text-xs">{errors.password.message}</p>
            )}
          </div>

          {/* Confirmar Senha */}
          {password && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Confirme a senha"
                className={errors.confirmPassword ? "border-red-500" : ""}
                disabled={isLoading}
                {...register("confirmPassword")}
                Icon={showPassword ? EyeOff : Eye}
                iconOnClick={() => setShowPassword(!showPassword)}
                iconPosition="right"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          )}

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
