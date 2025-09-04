import { Navigate } from "react-router-dom";
import { UserRole } from "@/types";
import { useAuth } from "@/context/use-auth";
import { Loading } from "./fallbacks";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();

  console.log("protected", isAuthenticated);
  console.log("user", user);

  if (isLoading) {
    return <Loading />;
  }

  // Usuário não autenticado
  if (!isAuthenticated) return <Navigate to={redirectTo} replace />;

  if (user?.role == UserRole.Admin) return <>{children}</>;

  // Usuário autenticado mas não tem permissão
  // @ts-ignore
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/menu" replace />;
  }

  return <>{children}</>;
}
