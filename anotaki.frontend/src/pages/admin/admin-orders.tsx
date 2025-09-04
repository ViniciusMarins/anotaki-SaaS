import { OrderStatus, type Order } from "@/types";
import { useState } from "react";
import { Eye, Trash2 } from "lucide-react";
import {
  GenericDataTable,
  type ActionConfig,
  type ColumnConfig,
} from "@/components/data-table/generic-data-table";
import { useMutationBase } from "@/hooks/mutations/use-mutation-base";
import GenericDeleteConfirmationModal from "@/components/modals/generic-delete-modal";
import {
  ChangeOrderStatus,
  DeleteOrder,
  GetPaginatedOrders,
} from "@/api/_requests/orders";
import { getOrderStatusChip } from "@/components/orders/orders-utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import DateRangeFilter from "@/components/filters/date-range-filter";
import OrderStatusFilter from "@/components/orders/order-status-filter";
import { formatDateWithTime, formatPriceWithCurrencyStyle } from "@/lib/utils";

export default function AdminOrders() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const navigate = useNavigate();

  const { deleteMutation: deleteOrderMutation, changeOrderStatus } =
    useMutationBase({
      queryKey: "orders",
      delete: { fn: DeleteOrder },
      customMutations: [
        {
          name: "changeOrderStatus",
          fn: ChangeOrderStatus,
          successMessage: "Status alterado com sucesso!",
        },
      ] as const,
    });

  const handleDeleteClick = (order: Order) => {
    setSelectedOrder(order);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedOrder) return;

    deleteOrderMutation.mutate(selectedOrder.id, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        setSelectedOrder(null);
      },
    });
  };

  const handleChangeOrderStatus = (order: Order, status: number) => {
    changeOrderStatus.mutate({ id: order.id, status });
  };

  // Configuração das colunas
  const columns: ColumnConfig<Order>[] = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      render: (order) => `#${order.id}`,
    },
    {
      key: "createdAt",
      label: "Data",
      align: "center",
      sortable: true,
      filterable: true,
      filterConfig: {
        component: DateRangeFilter,
      },
      render: (order) => (
        <span className="text-sm text-gray-500">
          {formatDateWithTime(order.createdAt)}
        </span>
      ),
    },
    {
      key: "orderStatus",
      label: "Status",
      sortable: true,
      align: "center",
      filterable: true,
      filterConfig: {
        component: OrderStatusFilter,
      },
      render: (order) => (
        <div className="w-fit mx-auto">
          <Select
            onValueChange={(value) =>
              handleChangeOrderStatus(order, parseInt(value))
            }
            value={order.orderStatus.toString()}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Selecione um status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status do Pedido</SelectLabel>
                {Object.values(OrderStatus)
                  .filter((value) => typeof value === "number")
                  .filter(
                    (status) =>
                      status !== OrderStatus.Cart && status >= order.orderStatus
                  )
                  .map((status) => (
                    <SelectItem
                      value={status.toString()}
                      key={status.toString()}
                    >
                      {getOrderStatusChip(status)}
                    </SelectItem>
                  ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      ),
    },
    {
      key: "totalPrice",
      label: "Preço",
      sortable: true,
      render: (order) => (
        <span className="font-semibold text-primary">
          {formatPriceWithCurrencyStyle(order.totalPrice)}
        </span>
      ),
    },
    {
      key: "paymentMethod",
      label: "Método de Pagamento",
      sortable: true,
      render: (order) => order.paymentMethod?.name,
    },
  ];

  // Configuração das ações
  const actions: ActionConfig<Order>[] = [
    {
      label: "Detalhes",
      icon: Eye,
      onClick: (order) => navigate(`/admin/orders/${order.id}`),
    },
    {
      label: "Excluir",
      icon: Trash2,
      onClick: handleDeleteClick,
      variant: "destructive",
    },
  ];

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold mb-6">Gerenciamento de pedidos</h1>

      <GenericDataTable<Order>
        queryKey="orders"
        queryWithoutCache={true}
        queryStaleTime={1}
        columns={columns}
        actions={actions}
        fetchData={GetPaginatedOrders}
        defaultSort={{ field: "id", direction: "desc" }}
        defaultPageSize={5}
        urlState
        emptyMessage="Nenhum pedido encontrado."
      />

      {/* Modal de confirmação de exclusão */}
      {isDeleteModalOpen && (
        <GenericDeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            if (!deleteOrderMutation.isPending) {
              setIsDeleteModalOpen(false);
              setSelectedOrder(null);
            }
          }}
          onConfirm={handleDeleteConfirm}
          isLoading={deleteOrderMutation.isPending}
          title="Você tem certeza que deseja excluir o pedido:"
          alertMessage={
            <div className="flex flex-col gap-2">
              <p>Todos os dados relacionados serão perdidos</p>
              <p>
                As métricas de vendas dos produtos do pedido já foram
                contabilizadas.
              </p>
            </div>
          }
          buttonText="Sim, Excluir Pedido"
          loadingText="Excluindo..."
        >
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                #{selectedOrder?.id}
              </p>
              {/* <p className="text-sm text-gray-600 truncate">
                {selectedOrder?.category?.name || "Sem categoria"}
              </p> */}
              <p className="text-sm font-medium text-green-600">
                R$ {selectedOrder?.totalPrice.toFixed(2).replace(".", ",")}
              </p>
            </div>
          </div>
        </GenericDeleteConfirmationModal>
      )}
    </main>
  );
}
