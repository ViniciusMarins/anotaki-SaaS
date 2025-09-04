import type { Category } from "@/types";
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
  CreateCategory,
  DeleteCategory,
  GetPaginatedCategories,
  UpdateCategory,
} from "@/api/_requests/categories";
import type { CategoryFormData } from "@/components/categories/category-modal";
import CategoryModal from "@/components/categories/category-modal";
import GenericDeleteConfirmationModal from "@/components/modals/generic-delete-modal";
import { formatDateWithoutTime } from "@/lib/utils";

export default function AdminCategories() {
  const [isModalAddOpen, setIsModalAddOpen] = useState(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const {
    createMutation: createCategoryMutation,
    deleteMutation: deleteCategoryMutation,
    updateMutation: updateCategoryMutation,
  } = useMutationBase({
    queryKey: "categories",
    create: { fn: CreateCategory },
    delete: { fn: DeleteCategory },
    update: { fn: UpdateCategory },
  });

  const handleAddProduct = (form: CategoryFormData) => {
    createCategoryMutation.mutate(form);
    setIsModalAddOpen(false);
  };

  const handleEditProduct = (form: CategoryFormData) => {
    if (!selectedCategory) return;

    updateCategoryMutation.mutate({
      id: selectedCategory.id,
      form: form,
    });

    setIsModalEditOpen(false);
    setSelectedCategory(null);
  };

  const handleDeleteClick = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedCategory) return;

    deleteCategoryMutation.mutate(selectedCategory.id, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        setSelectedCategory(null);
      },
    });
  };

  // Função para preparar dados iniciais para edição
  const getInitialEditData = (extra: Category): Partial<CategoryFormData> => {
    return {
      name: extra.name,
    };
  };

  // Configuração das colunas
  const columns: ColumnConfig<Category>[] = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      render: (extra) => `#${extra.id}`,
    },
    {
      key: "name",
      label: "Nome da Categoria",
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
  const actions: ActionConfig<Category>[] = [
    {
      label: "Editar",
      icon: Edit,
      onClick: (category) => {
        setSelectedCategory(category);
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
        Gerenciamento de categorias
      </h1>
      <GenericDataTable<Category>
        queryKey="categories"
        columns={columns}
        actions={actions}
        addButton={{
          label: "Adicionar Categoria",
          onClick: () => setIsModalAddOpen(true),
        }}
        fetchData={GetPaginatedCategories}
        defaultSort={{ field: "id", direction: "desc" }}
        defaultPageSize={5}
        emptyMessage="Nenhuma categoria encontrada."
      />

      {isModalAddOpen && (
        <CategoryModal
          isOpen={isModalAddOpen}
          onClose={() => setIsModalAddOpen(false)}
          onSubmit={handleAddProduct}
          isLoading={createCategoryMutation.isPending}
          mode="add"
        />
      )}

      {isModalEditOpen && (
        <CategoryModal
          isOpen={isModalEditOpen}
          onClose={() => {
            setIsModalEditOpen(false);
            setSelectedCategory(null);
          }}
          onSubmit={handleEditProduct}
          isLoading={updateCategoryMutation.isPending}
          initialData={
            selectedCategory ? getInitialEditData(selectedCategory) : undefined
          }
          mode="edit"
        />
      )}
      {/* Modal de confirmação de exclusão */}
      {isDeleteModalOpen && (
        <GenericDeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            if (!deleteCategoryMutation.isPending) {
              setIsDeleteModalOpen(false);
              setSelectedCategory(null);
            }
          }}
          onConfirm={handleDeleteConfirm}
          isLoading={deleteCategoryMutation.isPending}
          title="Você tem certeza que deseja excluir o extra:"
          alertMessage="Todos os dados relacionados serão perdidos"
          buttonText="Sim, Excluir Extra"
          loadingText="Excluindo..."
        >
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">
              {selectedCategory?.name}
            </p>
          </div>
        </GenericDeleteConfirmationModal>
      )}
    </main>
  );
}
