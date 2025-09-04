import type { FilterConfig } from "../data-table/generic-data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Filter } from "lucide-react";

interface ActiveStatusFilterProps {
  filterConfig: FilterConfig;
  setFilterConfig: any;
  field: string;
}

export function ActiveStatusFilter({
  filterConfig,
  setFilterConfig,
  field,
}: ActiveStatusFilterProps) {
  const statusOptions = [
    { value: true, label: "Ativo" },
    { value: false, label: "Inativo" },
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
          Todos
        </DropdownMenuItem>
        {statusOptions.map((status) => (
          <DropdownMenuItem
            className={`${
              filterConfig.value.toLowerCase() === status.label.toLowerCase()
                ? "bg-gray-100 border-l-[1px] border-l-primary"
                : ""
            }`}
            key={status.value.toString()}
            onClick={() => {
              setFilterConfig({ field, value: status.value.toString() });
            }}
          >
            {status.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
