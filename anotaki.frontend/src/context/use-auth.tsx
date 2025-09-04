import type { LoggedUser, User } from "@/types";
import { createContext, useContext } from "react";

interface AuthContextState {
  user: User | null;
  setUser: (user: User | null) => void;
  token: string | null;
  setToken: (token: string | null) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  authenticate: (data: LoggedUser) => void;
  logout: () => void;
}

const initialState: AuthContextState = {
  user: null,
  setUser: () => {},
  token: null,
  setToken: () => {},
  isAuthenticated: false,
  isLoading: true,
  setIsLoading: () => {},
  authenticate: () => {},
  logout: () => {},
};

export const AuthContext = createContext(initialState);

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined)
    throw new Error("useAuth must be used within a ThemeProvider");

  return context;
};
