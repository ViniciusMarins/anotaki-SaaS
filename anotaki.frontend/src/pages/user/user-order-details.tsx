import { GetOrderDetails } from "@/api/_requests/orders";
import { Loading } from "@/components/global/fallbacks";
import OrderDetails from "@/components/orders/order-details";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

export default function UserOrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order-details", id],
    queryFn: () => GetOrderDetails(parseInt(id!)),
    enabled: !!id,
    refetchOnWindowFocus: false,
  });

  if (isLoading) return <Loading />;
  if (!order) return <div>Pedido não encontrado</div>;

  return (
    <div className="max-w-5xl w-full mx-auto">
      <OrderDetails order={order} onBack={() => navigate("/my-orders")} />
    </div>
  );
}
