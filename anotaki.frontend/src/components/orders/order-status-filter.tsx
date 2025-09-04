import { Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import type { FilterConfig } from "../data-table/generic-data-table";
import { OrderStatus } from "@/types";
import { getOrderStatusChip } from "./orders-utils";

interface OrderStatusFilterProps {
  filterConfig: FilterConfig;
  setFilterConfig: any;
  field: string;
}

export default function OrderStatusFilter({
  filterConfig,
  setFilterConfig,
  field,
}: OrderStatusFilterProps) {
  // Pega todos os status exceto Cart
  const statusOptions = Object.values(OrderStatus)
    .filter((value) => typeof value === "number")
    .filter((status) => status !== OrderStatus.Cart) as OrderStatus[];

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
        {/* Opção "Todos" */}
        <DropdownMenuItem
          onClick={() => {
            setFilterConfig({ field: "", value: "" });
          }}
        >
          Todos
        </DropdownMenuItem>

        {/* Status options */}
        {statusOptions.map((status) => (
          <DropdownMenuItem
            key={status}
            onClick={() => {
              setFilterConfig({ field, value: status.toString() });
            }}
            className={`${
              filterConfig.value === status.toString() &&
              filterConfig.field === field
                ? "bg-gray-100 border-l-[1px] border-l-primary"
                : ""
            }`}
          >
            <div className="flex items-center gap-2">
              {getOrderStatusChip(status)}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
