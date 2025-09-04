import { OrderStatus } from "@/types";
import { Badge } from "../ui/badge";

const CHIP_WIDTH = "w-[90px]";

// Map dos status com suas configurações
export const ORDER_STATUS_MAP = {
  [OrderStatus.Cart]: {
    label: "Carrinho",
    colors: {
      border: "border-gray-500",
      text: "text-gray-700",
      background: "bg-gray-50",
      dot: "bg-gray-500",
    },
  },
  [OrderStatus.Pending]: {
    label: "Pendente",
    colors: {
      border: "border-yellow-500",
      text: "text-yellow-700",
      background: "bg-yellow-50",
      dot: "bg-yellow-500",
    },
  },
  [OrderStatus.Preparing]: {
    label: "Preparando",
    colors: {
      border: "border-blue-500",
      text: "text-blue-700",
      background: "bg-blue-50",
      dot: "bg-blue-500",
    },
  },
  [OrderStatus.OnTheWay]: {
    label: "A Caminho",
    colors: {
      border: "border-purple-500",
      text: "text-purple-700",
      background: "bg-purple-50",
      dot: "bg-purple-500",
    },
  },
  [OrderStatus.Delivered]: {
    label: "Entregue",
    colors: {
      border: "border-green-500",
      text: "text-green-700",
      background: "bg-green-50",
      dot: "bg-green-500",
    },
  },
  [OrderStatus.Cancelled]: {
    label: "Cancelado",
    colors: {
      border: "border-red-500",
      text: "text-red-700",
      background: "bg-red-50",
      dot: "bg-red-500",
    },
  },
} as const;

// Função para obter apenas as cores de um status
export const getOrderStatusColors = (status: OrderStatus) => {
  return (
    ORDER_STATUS_MAP[status]?.colors ||
    ORDER_STATUS_MAP[OrderStatus.Cart].colors
  );
};

// Função para obter o label de um status
export const getOrderStatusLabel = (status: OrderStatus) => {
  return ORDER_STATUS_MAP[status]?.label || "Desconhecido";
};

// Componente do chip usando o map
export const getOrderStatusChip = (status: OrderStatus) => {
  const statusConfig = ORDER_STATUS_MAP[status];

  if (!statusConfig) {
    return null;
  }

  const { label, colors } = statusConfig;
  const { border, text, background } = colors;

  return (
    <Badge
      variant="outline"
      className={`${border} ${text} ${background} ${CHIP_WIDTH}`}
    >
      {label}
    </Badge>
  );
};

// Função utilitária para obter todos os status disponíveis
export const getAllOrderStatuses = () => {
  return Object.keys(ORDER_STATUS_MAP).map((key) => ({
    status: parseInt(key) as OrderStatus,
    label: ORDER_STATUS_MAP[parseInt(key) as OrderStatus].label,
  }));
};

// Função para verificar se um status é válido
export const isValidOrderStatus = (status: number): status is OrderStatus => {
  return status in ORDER_STATUS_MAP;
};
