import type { PaymentMethod } from "@/types";
import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import {
  GenericDataTable,
  type ActionConfig,
  type ColumnConfig,
} from "@/components/data-table/generic-data-table";
("@/hooks/mutations/use-mutation-base");

import { useMutationBase } from "@/hooks/mutations/use-mutation-base";
import {
  CreatePaymentMethod,
  DeletePaymentMethod,
  GetPaginatedPaymentMethods,
  UpdatePaymentMethod,
} from "@/api/_requests/paymentMethods";
import type { PaymentMethodFormData } from "@/components/payment-methods/payment-method-modal";
import PaymentMethodModal from "@/components/payment-methods/payment-method-modal";
import GenericDeleteConfirmationModal from "@/components/modals/generic-delete-modal";
import { formatDateWithoutTime } from "@/lib/utils";

export default function AdminPaymentMethods() {
  const [isModalAddOpen, setIsModalAddOpen] = useState(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const {
    createMutation: createPaymentMethodMutation,
    deleteMutation: deletePaymentMethodMutation,
    updateMutation: updatePaymentMethodMutation,
  } = useMutationBase({
    queryKey: "payment-methods",
    create: { fn: CreatePaymentMethod },
    delete: { fn: DeletePaymentMethod },
    update: { fn: UpdatePaymentMethod },
  });

  const handleAddProduct = (form: PaymentMethodFormData) => {
    createPaymentMethodMutation.mutate(form);
    setIsModalAddOpen(false);
  };

  const handleEditProduct = (form: PaymentMethodFormData) => {
    if (!selectedPaymentMethod) return;

    updatePaymentMethodMutation.mutate({
      id: selectedPaymentMethod.id,
      form: form,
    });

    setIsModalEditOpen(false);
    setSelectedPaymentMethod(null);
  };

  const handleDeleteClick = (paymentMethod: PaymentMethod) => {
    setSelectedPaymentMethod(paymentMethod);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedPaymentMethod) return;

    deletePaymentMethodMutation.mutate(selectedPaymentMethod.id, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        setSelectedPaymentMethod(null);
      },
    });
  };

  // Função para preparar dados iniciais para edição
  const getInitialEditData = (
    extra: PaymentMethod
  ): Partial<PaymentMethodFormData> => {
    return {
      name: extra.name,
    };
  };

  // Configuração das colunas
  const columns: ColumnConfig<PaymentMethod>[] = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      render: (extra) => `#${extra.id}`,
    },
    {
      key: "name",
      label: "Nome do Método de Pagamento",
      sortable: true,
      render: (extra) => <div>{extra.name}</div>,
    },
    {
      key: "createdAt",
      label: "Data Criação",
      align: "center",
      sortable: true,
      render: (extra) => (
        <span className="text-sm text-gray-500">
          {formatDateWithoutTime(extra.createdAt)}
        </span>
      ),
    },
  ];

  // Configuração das ações
  const actions: ActionConfig<PaymentMethod>[] = [
    {
      label: "Editar",
      icon: Edit,
      onClick: (paymentMethod) => {
        setSelectedPaymentMethod(paymentMethod);
        setIsModalEditOpen(true);
      },
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
      <h1 className="text-xl font-semibold mb-6">
        Gerenciamento de métodos de pagamento
      </h1>
      <GenericDataTable<PaymentMethod>
        queryKey="payment-methods"
        columns={columns}
        actions={actions}
        addButton={{
          label: "Adicionar Método",
          onClick: () => setIsModalAddOpen(true),
        }}
        fetchData={GetPaginatedPaymentMethods}
        defaultSort={{ field: "id", direction: "desc" }}
        defaultPageSize={5}
        emptyMessage="Nenhum método de pagamento encontrado."
      />

      {isModalAddOpen && (
        <PaymentMethodModal
          isOpen={isModalAddOpen}
          onClose={() => setIsModalAddOpen(false)}
          onSubmit={handleAddProduct}
          isLoading={createPaymentMethodMutation.isPending}
          mode="add"
        />
      )}

      {isModalEditOpen && (
        <PaymentMethodModal
          isOpen={isModalEditOpen}
          onClose={() => {
            setIsModalEditOpen(false);
            setSelectedPaymentMethod(null);
          }}
          onSubmit={handleEditProduct}
          isLoading={updatePaymentMethodMutation.isPending}
          initialData={
            selectedPaymentMethod
              ? getInitialEditData(selectedPaymentMethod)
              : undefined
          }
          mode="edit"
        />
      )}

      {/* Modal de confirmação de exclusão */}
      {isDeleteModalOpen && (
        <GenericDeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            if (!deletePaymentMethodMutation.isPending) {
              setIsDeleteModalOpen(false);
              setSelectedPaymentMethod(null);
            }
          }}
          onConfirm={handleDeleteConfirm}
          isLoading={deletePaymentMethodMutation.isPending}
          title="Você tem certeza que deseja excluir o extra:"
          alertMessage="Todos os dados relacionados serão perdidos"
          buttonText="Sim, Excluir Extra"
          loadingText="Excluindo..."
        >
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">
              {selectedPaymentMethod?.name}
            </p>
          </div>
        </GenericDeleteConfirmationModal>
      )}
    </main>
  );
}
