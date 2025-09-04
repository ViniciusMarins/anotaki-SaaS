import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Check, Circle, Eye, EyeOff } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRegister } from "@/hooks/mutations/use-register-mutation";
import { customToast } from "@/components/global/toast";
import { formatCPF, validateCPF } from "@/lib/utils";

const checkPasswordRequirements = (password: string) => {
  return {
    minLength: password.length >= 8,
    hasLetter: /[a-zA-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    // hasSpecial: /[^a-zA-Z0-9]/.test(password),
  };
};

const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Nome é obrigatório")
      .min(2, "Nome deve ter pelo menos 2 caracteres")
      .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras"),
    email: z
      .string()
      .min(1, "Email é obrigatório")
      .email("Digite um email válido"),
    password: z
      .string()
      .min(1, "Senha é obrigatória")
      .min(8, "Senha deve ter pelo menos 8 caracteres")
      .regex(/[a-zA-Z]/, "Senha deve conter pelo menos uma letra")
      .regex(/[0-9]/, "Senha deve conter pelo menos um número"),
    // .regex(
    //   /[^a-zA-Z0-9]/,
    //   "Senha deve conter pelo menos um caractere especial"
    // ),
    confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
    cpf: z
      .string()
      .min(1, "CPF é obrigatório")
      .refine((cpf) => validateCPF(cpf), "CPF inválido"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);

  const registerMutation = useRegister();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    registerMutation.mutate(data, {
      onSuccess: () => {
        navigate("/login");
        customToast.success(
          "Cadastro realizado com sucesso. Por favor, realize o login."
        );
      },
      onError: () => {
        customToast.error(
          "Não foi possível realizar o cadastro. Tente novamente mais tarde."
        );
      },
    });
  };

  const password = watch("password");
  const passwordRequirements = checkPasswordRequirements(password || "");
  const isSubmitting = registerMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex items-center gap-5 justify-center">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
              Crie sua conta <span className="text-primary">Anotaki</span>
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Preencha os dados abaixo para se cadastrar
            </p>
          </div>
          <img src="/anotaki_img.png" className="size-24"></img>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Campo Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Digite seu nome completo"
                className={errors.name ? "border-red-500" : ""}
                disabled={isSubmitting}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-red-500 text-xs">{errors.name.message}</p>
              )}
            </div>

            {/* Campo Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Digite seu email"
                className={errors.email ? "border-red-500" : ""}
                disabled={isSubmitting}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email.message}</p>
              )}
            </div>

            {/* Campo CPF */}
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                type="text"
                maxLength={14}
                placeholder="000.000.000-00"
                className={errors.cpf ? "border-red-500" : ""}
                disabled={isSubmitting}
                {...register("cpf")}
                onChange={(e) => {
                  e.target.value = formatCPF(e.target.value);
                }}
              />
              {errors.cpf && (
                <p className="text-red-500 text-xs">{errors.cpf.message}</p>
              )}
            </div>

            {/* Campo Senha */}
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha"
                className={errors.password ? "border-red-500" : ""}
                disabled={isSubmitting}
                {...register("password")}
                Icon={showPassword ? EyeOff : Eye}
                iconOnClick={() => setShowPassword(!showPassword)}
                iconPosition="right"
              />

              <div className="mt-2">
                <p className="text-sm text-gray-700 mb-1">A senha deve:</p>
                <ul className="text-xs space-y-1">
                  {[
                    { key: "minLength", text: "Ter pelo menos 8 caracteres" },
                    { key: "hasLetter", text: "Conter pelo menos uma letra" },
                    { key: "hasNumber", text: "Conter pelo menos um número" },
                    // {
                    //   key: "hasSpecial",
                    //   text: "Conter pelo menos um caractere especial",
                    // },
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
            </div>

            {/* Campo Confirmar Senha */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Confirme sua senha"
                className={errors.confirmPassword ? "border-red-500" : ""}
                disabled={isSubmitting}
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
          </div>

          {/* Termos e Condições */}
          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
              Eu aceito os{" "}
              <Link to="/terms" className="text-primary hover:text-primary/80">
                termos de uso
              </Link>{" "}
              e{" "}
              <Link
                to="/privacy"
                className="text-primary hover:text-primary/80"
              >
                política de privacidade
              </Link>
            </label>
          </div>

          {/* Botão de Submit */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white cursor-pointer ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              } transition-colors duration-200`}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <Circle className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  Criando conta...
                </div>
              ) : (
                "Criar conta"
              )}
            </button>
          </div>

          {/* Link para login */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{" "}
              <Link
                to="/login"
                className="font-medium text-primary hover:text-primary/80"
              >
                Faça login aqui
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
