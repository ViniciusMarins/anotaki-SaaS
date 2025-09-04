import { useState, useEffect, type ReactNode, useRef } from "react";
import type { LoggedUser, User } from "@/types";
import { AuthContext } from "./use-auth";
import { useLogout, useRefresh } from "@/hooks/mutations/use-auth-mutations";

let externalLogout: (() => void) | null = null;
let externalSetToken: ((token: string) => void) | null = null;
let externalToken: (() => string | null) | null = null;

export function getExternalAuthActions() {
  return {
    logout: externalLogout,
    setToken: externalSetToken,
    token: externalToken,
  };
}

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children, ...props }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const tokenRef = useRef<string | null>(null);
  const isAuthenticated = !!token;

  const { refreshMutation } = useRefresh();
  const { logoutMutation } = useLogout();

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  useEffect(() => {
    externalLogout = logout;
    externalSetToken = setToken;
    externalToken = () => tokenRef.current;
  }, []);

  useEffect(() => {
    async function handleRefresh() {
      if (!token) {
        console.log("Token nulo, fazendo refresh...");

        await refreshMutation.mutateAsync(undefined, {
          onSuccess: (data) => {
            authenticate(data);
          },
          onError: (error) => {
            console.error("Erro ao fazer refresh do token:", error);
            logout();
          },
        });
      } else {
        setIsLoading(false);
      }
    }

    handleRefresh();
  }, []);

  const authenticate = (data: LoggedUser) => {
    setUser(data.user);
    setToken(data.token);
    setIsLoading(false);

    console.log("Autenticado com sucesso");
  };

  async function logout() {
    setIsLoading(true);
    await logoutMutation.mutateAsync(undefined, {
      onSuccess: () => {
        setUser(null);
        setToken(null);
        console.log("Logout realizado com sucesso");
      },
      onError: (error) => {
        console.error("Erro ao fazer logout:", error);
      },
    });

    setIsLoading(false);
  }

  return (
    <AuthContext.Provider
      {...props}
      value={{
        user,
        setUser,
        token,
        setToken,
        isAuthenticated,
        isLoading,
        setIsLoading,
        authenticate,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
