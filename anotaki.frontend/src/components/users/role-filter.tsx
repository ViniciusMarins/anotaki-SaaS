import { UserRole } from "@/types";
import type { FilterConfig } from "../data-table/generic-data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Filter } from "lucide-react";

interface RoleFilterProps {
  filterConfig: FilterConfig;
  setFilterConfig: any;
  field: string;
}

export function RoleFilter({
  filterConfig,
  setFilterConfig,
  field,
}: RoleFilterProps) {
  const roleOptions = [
    { value: UserRole.Default, label: "Default" },
    { value: UserRole.Admin, label: "Admin" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Filter
          className={`w-4 h-4 ml-1 cursor-pointer ${
            filterConfig.value !== "" && filterConfig.field === field
              ? "text-primary"
              : "text-gray-400"
          }`}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            setFilterConfig({ field: "", value: "" });
          }}
        >
          Todas
        </DropdownMenuItem>
        {roleOptions.map((role) => (
          <DropdownMenuItem
            className={`${
              filterConfig.value.toLowerCase() === role.label.toLowerCase()
                ? "bg-gray-100 border-l-[1px] border-l-primary"
                : ""
            }`}
            key={role.value}
            onClick={() => {
              setFilterConfig({ field, value: role.value.toString() });
            }}
          >
            {role.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
