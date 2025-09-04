// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./assets/css/App.css";
import App from "./App.tsx";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/auth-provider.tsx";
import { AxiosError } from "axios";
import { customToast } from "./components/global/toast.tsx";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => customToast.error(error.message),
  }),
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) return false;
        }

        return failureCount < 1;
      },
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);
