import { GetCart } from "@/api/_requests/orders";
import { useAuth } from "@/context/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Home, LogOut, Package, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

export function BottomNavigation() {
  const { data: cart } = useQuery({
    queryKey: ["get-cart"],
    queryFn: GetCart,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const { logout } = useAuth();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="flex items-center justify-around py-2">
        <Link to={"/menu"}>
          <button className="flex flex-col items-center py-2 px-4 text-primary cursor-pointer">
            <Home className="w-5 h-5 mb-1" />
            <span className="text-sm font-medium">Início</span>
          </button>
        </Link>

        <Link to={"/my-orders"}>
          <button className="flex flex-col items-center py-2 px-4 text-gray-500 hover:text-primary cursor-pointer">
            <Package className="w-5 h-5 mb-1" />
            <span className="text-sm">Pedidos</span>
          </button>
        </Link>

        <Link to={"/my-cart"}>
          <button className="flex flex-col items-center py-2 px-4 text-gray-500 hover:text-primary relative cursor-pointer">
            <ShoppingCart className="w-5 h-5 mb-1" />
            <span className="text-sm">Carrinho</span>
            {cart?.items && cart?.items.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cart?.items.length}
              </span>
            )}
          </button>
        </Link>

        <button
          onClick={logout}
          className="flex flex-col items-center py-2 px-4 text-gray-500 hover:text-red-600 relative cursor-pointer"
        >
          <LogOut className="w-5 h-5 mb-1" />
          <span className="text-sm">Sair</span>
        </button>
      </div>
    </nav>
  );
}
