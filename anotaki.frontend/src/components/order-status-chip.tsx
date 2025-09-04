import { OrderStatus } from "@/types";

const statusColors: Record<Exclude<OrderStatus, OrderStatus.Cart>, string> = {
  [OrderStatus.Pending]: "bg-yellow-100 border-yellow-300 text-yellow-800",
  [OrderStatus.Preparing]: "bg-blue-100 border-blue-300 text-blue-800",
  [OrderStatus.OnTheWay]: "bg-indigo-100 border-indigo-300 text-indigo-800",
  [OrderStatus.Delivered]: "bg-green-100 border-green-300 text-green-800",
  [OrderStatus.Cancelled]: "bg-red-100 border-red-300 text-red-800",
};

interface OrderStatusChipProps {
  orderStatus: OrderStatus;
}

export function OrderStatusChip({ orderStatus }: OrderStatusChipProps) {
  if (orderStatus === OrderStatus.Cart) return null;

  const colorClasses =
    statusColors[orderStatus as Exclude<OrderStatus, OrderStatus.Cart>];

  const statusLabelMap: Record<OrderStatus, string> = {
    [OrderStatus.Cart]: "Carrinho",
    [OrderStatus.Pending]: "Pendente",
    [OrderStatus.Preparing]: "Preparando",
    [OrderStatus.OnTheWay]: "A caminho",
    [OrderStatus.Delivered]: "Entregue",
    [OrderStatus.Cancelled]: "Cancelado",
  };

  return (
    <span
      className={`text-xs border-[1px] px-2 rounded-sm flex items-center justify-center mb-1 ${colorClasses}`}
    >
      {statusLabelMap[orderStatus]}
    </span>
  );
}
