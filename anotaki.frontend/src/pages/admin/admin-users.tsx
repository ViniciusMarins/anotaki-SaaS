import { UserRole, type User } from "@/types";
import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import {
  GenericDataTable,
  type ActionConfig,
  type ColumnConfig,
} from "@/components/data-table/generic-data-table";
import { useMutationBase } from "@/hooks/mutations/use-mutation-base";
import GenericDeleteConfirmationModal from "@/components/modals/generic-delete-modal";
import {
  DeleteUser,
  GetPaginatedUsers,
  UpdateUser,
} from "@/api/_requests/users";
import { RoleFilter } from "@/components/users/role-filter";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ActiveStatusFilter } from "@/components/filters/status-filter";
import UserModal, { type UserFormData } from "@/components/users/user-modal";
import { formatCPF, formatDateWithoutTime } from "@/lib/utils";

export default function AdminUsers() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);

  const {
    // createMutation: createUserMutation,
    updateMutation: updateUserMutation,
    deleteMutation: deleteUserMutation,
  } = useMutationBase({
    queryKey: "users",
    delete: { fn: DeleteUser },
    update: { fn: UpdateUser },
  });

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedUser) return;

    deleteUserMutation.mutate(selectedUser.id, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        setSelectedUser(null);
      },
    });
  };

  const handleEditUser = (data: UserFormData) => {
    if (!selectedUser) return;
    updateUserMutation.mutate(
      { id: selectedUser.id, form: data },
      {
        onSuccess: () => {
          setIsModalEditOpen(false);
          setSelectedUser(null);
        },
      }
    );
  };

  const getInitialEditData = (user: User): Partial<UserFormData> => {
    return {
      name: user.name,
      email: user.email,
      cpf: user.cpf,
      //etc...
    };
  };

  // Configuração das colunas
  const columns: ColumnConfig<User>[] = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      render: (user) => `#${user?.id}`,
    },
    {
      key: "role",
      label: "Cargo",
      sortable: true,
      filterable: true,
      filterConfig: {
        component: RoleFilter,
      },
      render: (user) => UserRole[user?.role],
    },
    {
      key: "name",
      label: "Usuário",
      align: "left",
      sortable: true,
      render: (user) => (
        <div>
          <div className="font-bold">{user?.name}</div>
          <Tooltip>
            <TooltipTrigger>
              <div className="text-sm text-gray-500 truncate max-w-xs">
                {user?.email}
              </div>
            </TooltipTrigger>
            <TooltipContent>{user?.email}</TooltipContent>
          </Tooltip>
        </div>
      ),
    },
    {
      key: "cpf",
      label: "CPF do Usuário",
      sortable: true,
      render: (user) => formatCPF(user?.cpf),
    },
    {
      key: "isActive",
      label: "Ativo",
      filterable: true,
      filterConfig: {
        component: ActiveStatusFilter,
      },
      sortable: true,
      render: (user) => (user?.isActive ? "Sim" : "Não"),
    },
    {
      key: "ordersCount",
      label: "Compras",
      sortable: true,
      render: (user) => (
        <span className="text-green-600 font-medium">
          {user?.ordersCount} compras
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Data Criação",
      align: "center",
      sortable: true,
      render: (user) => (
        <span className="text-sm text-gray-500">
          {formatDateWithoutTime(user?.createdAt)}
        </span>
      ),
    },
  ];

  // Configuração das ações
  const actions: ActionConfig<User>[] = [
    {
      label: "Editar",
      icon: Edit,
      onClick: (user) => {
        setSelectedUser(user);
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
      <h1 className="text-xl font-semibold mb-6">Gerenciamento de usuários</h1>

      <GenericDataTable<User>
        queryKey="users"
        columns={columns}
        actions={actions}
        // addButton={{
        //   label: "Adicionar Usuário",
        //   onClick: () => setIsModalAddOpen(true),
        // }}
        fetchData={GetPaginatedUsers}
        defaultSort={{ field: "id", direction: "desc" }}
        defaultPageSize={5}
        emptyMessage="Nenhum usuário encontrado."
      />

      {isModalEditOpen && (
        <UserModal
          isOpen={isModalEditOpen}
          onClose={() => {
            setIsModalEditOpen(false);
            setSelectedUser(null);
          }}
          onSubmit={handleEditUser}
          isLoading={updateUserMutation.isPending}
          initialData={
            selectedUser ? getInitialEditData(selectedUser) : undefined
          }
          mode="edit"
        />
      )}

      {/* Modal de confirmação de exclusão */}
      {isDeleteModalOpen && (
        <GenericDeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            if (!deleteUserMutation.isPending) {
              setIsDeleteModalOpen(false);
              setSelectedUser(null);
            }
          }}
          onConfirm={handleDeleteConfirm}
          isLoading={deleteUserMutation.isPending}
          title="Você tem certeza que deseja excluir o usuário:"
          alertMessage="Todos os dados relacionados serão perdidos"
          buttonText="Sim, Excluir Usuário"
          loadingText="Excluindo..."
        >
          <div className="flex items-start gap-3">
            {/* Informações do produto */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {selectedUser?.name}
              </p>
              <p className="text-sm text-gray-600 truncate">
                {selectedUser?.email}
              </p>
              {selectedUser && selectedUser?.ordersCount > 0 && (
                <p className="text-xs text-orange-600 font-medium">
                  ⚠️ {selectedUser?.ordersCount} compra
                  {selectedUser?.ordersCount > 1 ? "s" : ""} registrada
                  {selectedUser?.ordersCount > 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
        </GenericDeleteConfirmationModal>
      )}
    </main>
  );
}
