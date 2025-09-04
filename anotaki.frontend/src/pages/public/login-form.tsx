import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Circle, Eye, EyeOff } from "lucide-react";
import { useLogin } from "@/hooks/mutations/use-auth-mutations";
import { UserRole } from "@/types";
import { useState } from "react";
import { useAuth } from "@/context/use-auth";
import { customToast } from "@/components/global/toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Schema de validação com Zod
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Digite um email válido"),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useLogin();
  const { authenticate } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    loginMutation.mutate(data, {
      onSuccess: (data) => {
        authenticate(data);

        data.user.role == UserRole.Admin
          ? navigate("/admin")
          : navigate("/menu");
      },
      onError: () => {
        customToast.error(
          "Não foi possível realizar o login. Verifique suas credenciais ou tente novamente mais tarde."
        );
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex items-center gap-5 justify-center">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
              Acesse seu <span className="text-primary">Anotaki</span>
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Digite suas credenciais para acessar
            </p>
          </div>
          <img src="/anotaki_img.png" className="size-24"></img>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Campo Email */}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Digite o seu email"
                className={errors.email ? "border-red-500" : ""}
                disabled={loginMutation.isPending}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Digite a sua senha"
                className={errors.password ? "border-red-500" : ""}
                disabled={loginMutation.isPending}
                {...register("password")}
                Icon={showPassword ? EyeOff : Eye}
                iconOnClick={() => setShowPassword(!showPassword)}
                iconPosition="right"
              />
              {errors.password && (
                <p className="text-red-500 text-xs">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          {/* Botão de Submit */}
          <div>
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white cursor-pointer ${loginMutation.isPending
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                } transition-colors duration-200`}
            >
              {loginMutation.isPending ? (
                <div className="flex items-center">
                  <Circle className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  Entrando...
                </div>
              ) : (
                "Entrar"
              )}
            </button>
          </div>

          {/* Link para cadastro */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{" "}
              <Link
                to="/register"
                className="font-medium text-primary hover:text-primary/80"
              >
                Cadastre-se aqui
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
