import type { Extra } from "@/types";
import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import {
  GenericDataTable,
  type ActionConfig,
  type ColumnConfig,
} from "@/components/data-table/generic-data-table";
("@/hooks/mutations/use-mutation-base");
import {
  CreateExtra,
  DeleteExtra,
  GetPaginatedExtras,
  UpdateExtra,
} from "@/api/_requests/extras";
import type { ExtraFormData } from "@/components/extras/extra-modal";
import ExtraModal from "@/components/extras/extra-modal";
import { useMutationBase } from "@/hooks/mutations/use-mutation-base";
import GenericDeleteConfirmationModal from "@/components/modals/generic-delete-modal";
import { ActiveStatusFilter } from "@/components/filters/status-filter";
import {
  formatDateWithoutTime,
  formatPriceWithCurrencyStyle,
} from "@/lib/utils";

export default function AdminExtras() {
  const [isModalAddOpen, setIsModalAddOpen] = useState(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);
  const [selectedExtra, setSelectedExtra] = useState<Extra | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const {
    createMutation: createExtraMutation,
    deleteMutation: deleteExtraMutation,
    updateMutation: updateExtraMutation,
  } = useMutationBase({
    queryKey: "extras",
    create: { fn: CreateExtra },
    delete: { fn: DeleteExtra },
    update: { fn: UpdateExtra },
  });

  const handleAddProduct = (form: ExtraFormData) => {
    createExtraMutation.mutate(form);
    setIsModalAddOpen(false);
  };

  const handleEditProduct = (form: ExtraFormData) => {
    if (!selectedExtra) return;

    updateExtraMutation.mutate({
      id: selectedExtra.id,
      form: form,
    });

    setIsModalEditOpen(false);
    setSelectedExtra(null);
  };

  const handleDeleteClick = (extra: Extra) => {
    setSelectedExtra(extra);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedExtra) return;

    deleteExtraMutation.mutate(selectedExtra.id, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        setSelectedExtra(null);
      },
    });
  };

  // Função para preparar dados iniciais para edição
  const getInitialEditData = (extra: Extra): Partial<ExtraFormData> => {
    return {
      name: extra.name,
      price: extra.price.toString(),
    };
  };

  // Configuração das colunas
  const columns: ColumnConfig<Extra>[] = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      render: (extra) => `#${extra.id}`,
    },
    {
      key: "name",
      label: "Nome do Extra",
      sortable: true,
      render: (extra) => <div>{extra.name}</div>,
    },
    {
      key: "price",
      label: "Preço",
      align: "center",
      sortable: true,
      render: (extra) => (
        <span className="font-medium">
          {formatPriceWithCurrencyStyle(extra.price)}
        </span>
      ),
    },
    {
      key: "isActive",
      label: "Ativo",
      align: "center",
      filterable: true,
      filterConfig: {
        component: ActiveStatusFilter,
      },
      sortable: true,
      render: (extra) => (
        <span className="text-sm text-gray-500">
          {extra.isActive ? "Sim" : "Não"}
        </span>
      ),
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
  const actions: ActionConfig<Extra>[] = [
    {
      label: "Editar",
      icon: Edit,
      onClick: (extra) => {
        setSelectedExtra(extra);
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
      <h1 className="text-xl font-semibold mb-6">Gerenciamento de extras</h1>
      <GenericDataTable<Extra>
        queryKey="extras"
        columns={columns}
        actions={actions}
        addButton={{
          label: "Adicionar Extra",
          onClick: () => setIsModalAddOpen(true),
        }}
        fetchData={GetPaginatedExtras}
        defaultSort={{ field: "id", direction: "desc" }}
        defaultPageSize={5}
        emptyMessage="Nenhum extra encontrado."
      />

      {isModalAddOpen && (
        <ExtraModal
          isOpen={isModalAddOpen}
          onClose={() => setIsModalAddOpen(false)}
          onSubmit={handleAddProduct}
          isLoading={createExtraMutation.isPending}
          mode="add"
        />
      )}

      {isModalEditOpen && (
        <ExtraModal
          isOpen={isModalEditOpen}
          onClose={() => {
            setIsModalEditOpen(false);
            setSelectedExtra(null);
          }}
          onSubmit={handleEditProduct}
          isLoading={updateExtraMutation.isPending}
          initialData={
            selectedExtra ? getInitialEditData(selectedExtra) : undefined
          }
          mode="edit"
        />
      )}

      {/* Modal de confirmação de exclusão */}
      {isDeleteModalOpen && (
        <GenericDeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            if (!deleteExtraMutation.isPending) {
              setIsDeleteModalOpen(false);
              setSelectedExtra(null);
            }
          }}
          onConfirm={handleDeleteConfirm}
          isLoading={deleteExtraMutation.isPending}
          title="Você tem certeza que deseja excluir o extra:"
          alertMessage="Todos os dados relacionados serão perdidos"
          buttonText="Sim, Excluir Extra"
          loadingText="Excluindo..."
        >
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">
              {selectedExtra?.name}
            </p>
            <p className="text-sm font-medium text-green-600">
              {formatPriceWithCurrencyStyle(selectedExtra?.price ?? 0)}
            </p>
          </div>
        </GenericDeleteConfirmationModal>
      )}
    </main>
  );
}
