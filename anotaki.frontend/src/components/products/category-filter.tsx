import { Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import type { FilterConfig } from "../data-table/generic-data-table";
import { useQuery } from "@tanstack/react-query";
import { GetCategories } from "@/api/_requests/categories";

interface CategoryFilterProps {
  filterConfig: FilterConfig;
  setFilterConfig: any;
  field: string;
}

export default function CategoryFilter({
  filterConfig,
  setFilterConfig,
  field,
}: CategoryFilterProps) {
  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => GetCategories(),
    staleTime: 30000,
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Filter
          className={`w-4 h-4 ml-1  cursor-pointer ${
            filterConfig.value !== "" && filterConfig.field === field
              ? "text-primary"
              : "text-gray-400"
          }`}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isCategoriesLoading ? (
          <DropdownMenuItem>
            <div className="animate-spin rounded-full size-5 border-b-2 border-gray-900 mx-auto" />
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem
              onClick={() => {
                setFilterConfig({ field: "", value: "" });
              }}
            >
              Todas
            </DropdownMenuItem>
            {categories &&
              categories.map((category) => (
                <DropdownMenuItem
                  className={`${
                    filterConfig.value.toLocaleLowerCase() ==
                    category.name.toLowerCase()
                      ? "bg-gray-100 border-l-[1px] border-l-primary"
                      : ""
                  }  `}
                  key={category.id}
                  onClick={() => {
                    setFilterConfig({ field, value: category.name });
                  }}
                >
                  {category.name}
                </DropdownMenuItem>
              ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
