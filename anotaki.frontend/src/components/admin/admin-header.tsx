import { Bell, Menu, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/use-auth";
import { useState } from "react";
import type { User } from "@/types";
import UserModal, { type UserFormData } from "../users/user-modal";
import { UpdateUser } from "@/api/_requests/users";
import { useMutation } from "@tanstack/react-query";
import { customToast } from "../global/toast";

export function AdminHeader({
  isSideBarOpen,
  setIsSideBarOpen,
}: {
  isSideBarOpen: boolean;
  setIsSideBarOpen: any;
}) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);

  const { user, setUser } = useAuth();

  const updateUserMutation = useMutation({
    mutationKey: ["updateLoggedUser"],
    mutationFn: UpdateUser,
  });

  const handleEditUser = (data: UserFormData) => {
    if (!selectedUser) return;
    updateUserMutation.mutate(
      { id: selectedUser.id, form: data },
      {
        onSuccess: (data) => {
          setUser({ ...user, ...data });
          setIsModalEditOpen(false);
          setSelectedUser(null);

          customToast.success("Informações atualizadas com sucesso!");
        },
      }
    );
  };

  const getInitialEditData = (user: User): Partial<UserFormData> => {
    return {
      name: user.name,
      email: user.email,
      cpf: user.cpf,
    };
  };

  return (
    <>
      <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div
          className="flex items-center gap-4 flex-1 mr-4 cursor-pointer md:hidden"
          onClick={() => setIsSideBarOpen(!isSideBarOpen)}
        >
          <Menu />
        </div>

        <div className="flex items-center gap-4 justify-between w-full">
          <div>
            {user && (
              <>
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </>
            )}
          </div>

          <div>
            {/* Profile */}
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer"
              onClick={() => {
                setIsModalEditOpen(true);
                setSelectedUser(user);
              }}
            >
              <UserIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

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
    </>
  );
}
