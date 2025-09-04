import type { PaginatedDataResponse } from "@/types";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BaseSortableHeader } from "@/components/data-table/sortable-table-header";
import { usePagination } from "@/hooks/data-table/use-pagination";
import {
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
  Plus,
} from "lucide-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useTableState } from "@/hooks/data-table/use-url-state";
import { Checkbox } from "../ui/checkbox";
import { useMediaQuery } from "usehooks-ts";

export interface FilterConfig {
  field: string;
  value: string;
}

export interface SortConfig {
  field: string;
  direction: "asc" | "desc";
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  filterBy?: string;
  filter?: string;
}

export interface ColumnFilterConfig {
  component: React.ComponentType<{
    filterConfig: FilterConfig;
    setFilterConfig: (config: FilterConfig) => void;
    field: string;
  }>;
}

export interface ColumnConfig<T> {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  filterConfig?: ColumnFilterConfig;
  render?: (item: T) => React.ReactNode;
  align?: "left" | "center" | "right";
}

export interface ActionConfig<T> {
  label: string | ((item: T) => React.ReactNode);
  icon: React.ComponentType<{ className?: string }>;
  onClick: (item: T) => void;
  variant?: "default" | "destructive";
  show?: (item: T) => boolean;
}

export interface DataTableConfig<T> {
  queryKey: string;
  queryStaleTime?: number;
  columns: ColumnConfig<T>[];
  actions?: ActionConfig<T>[];
  addButton?: {
    label: string;
    onClick: () => void;
  };
  fetchData: (
    paginationParams: PaginationParams
  ) => Promise<PaginatedDataResponse<T>>;
  defaultSort?: SortConfig;
  defaultFilter?: FilterConfig;
  defaultPageSize?: number;
  emptyMessage?: string;
  urlState?: boolean;
  selectable?: boolean;
  queryWithoutCache?: boolean;
}

export function GenericDataTable<T extends { id: any }>({
  queryKey,
  columns,
  actions = [],
  addButton,
  fetchData,
  defaultSort = { field: "id", direction: "desc" },
  defaultFilter = { field: "", value: "" },
  defaultPageSize = 5,
  emptyMessage = "Nenhum registro encontrado.",
  urlState = false,
  selectable = false,
  queryWithoutCache = false,
  queryStaleTime,
}: DataTableConfig<T>) {
  const [selectedItems, setSelectedItems] = useState<T[]>([]);

  const isMd = useMediaQuery("(min-width: 768px)");

  const { state, updateState } = useTableState(
    defaultSort,
    defaultFilter,
    defaultPageSize,
    urlState
  );

  const sortConfig: SortConfig = {
    field: state.sortField,
    direction: state.sortDirection,
  };

  const filterConfig: FilterConfig = {
    field: state.filterField,
    value: state.filterValue,
  };

  const paginationParams: PaginationParams = {
    page: state.page,
    pageSize: state.pageSize,
    sortBy: sortConfig.field,
    sortDirection: sortConfig.direction,
    filterBy: filterConfig.field,
    filter: filterConfig.value,
  };

  const { data, isLoading, error } = useQuery({
    queryKey: [queryKey, paginationParams],
    queryFn: () => fetchData(paginationParams),
    placeholderData: keepPreviousData,
    staleTime: queryWithoutCache
      ? 0
      : queryStaleTime
      ? queryStaleTime * 1000 * 60
      : 1 * 1000 * 60, // default 1 minute
    gcTime: queryWithoutCache ? 0 : undefined,
  });

  const { endRange, startRange, totalItems } = usePagination(data);

  useEffect(() => {
    if (data && data.totalItems > 0 && state.page > data.totalPages) {
      const validPage = Math.max(1, data.totalPages);
      updateState({ page: validPage });
    }

    if (data && data.totalItems === 0 && state.page > 1) {
      updateState({ page: 1 });
    }
  }, [data, state.page]);

  const handlePageSizeChange = (value: string) => {
    const intValue = Number.parseInt(value);
    updateState({ pageSize: intValue, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    if (data && data.totalPages > 0) {
      const validPage = Math.min(Math.max(1, newPage), data.totalPages);
      updateState({ page: validPage });
    } else {
      updateState({ page: Math.max(1, newPage) });
    }
  };

  const handleSortChange = (newSortConfig: SortConfig) => {
    updateState({
      sortField: newSortConfig.field,
      sortDirection: newSortConfig.direction,
      page: 1, // Reset para primeira página ao ordenar
    });
  };

  const handleFilterChange = (newFilterConfig: FilterConfig) => {
    updateState({
      filterField: newFilterConfig.field,
      filterValue: newFilterConfig.value,
      page: 1, // Reset para primeira página ao filtrar
    });
  };

  function handleChangeSelectedItems(item: T, flag: boolean | string) {
    if (flag || flag == "true") {
      setSelectedItems([...selectedItems, item]);
    } else {
      const updatedItems = selectedItems.filter((x) => x.id !== item.id);
      setSelectedItems(updatedItems);
    }
  }

  function isItemChecked(id: any) {
    return selectedItems.find((x) => x.id == id) ? true : false;
  }

  useEffect(() => {
    setSelectedItems([]);
  }, [state]);

  const SortableHeader = ({
    field,
    children,
  }: {
    field: string;
    children: React.ReactNode;
  }) => (
    <BaseSortableHeader
      field={field}
      setSortConfig={handleSortChange}
      sortConfig={sortConfig}
    >
      {children}
    </BaseSortableHeader>
  );

  const renderFilter = (column: ColumnConfig<T>) => {
    if (!column.filterable || !column.filterConfig) return null;

    const { component: CustomComponent } = column.filterConfig;

    if (CustomComponent) {
      return (
        <CustomComponent
          filterConfig={filterConfig}
          setFilterConfig={handleFilterChange}
          field={column.key}
        />
      );
    }
  };

  const isPreviousDisabled = state.page <= 1;
  const isNextDisabled = data ? state.page >= data.totalPages : true;

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Erro ao carregar dados: {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {addButton && (
          <Button
            onClick={addButton.onClick}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            {addButton.label}
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                {selectable && (
                  <TableHead className="px-6">
                    <Checkbox
                      className="mx-auto"
                      checked={data?.items.length == selectedItems.length}
                      onCheckedChange={(e) => {
                        if (e.valueOf()) {
                          setSelectedItems(data?.items ?? []);
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                    />
                  </TableHead>
                )}
                {columns.map((column) => (
                  <React.Fragment key={column.key}>
                    {column.sortable ? (
                      <SortableHeader field={column.key}>
                        <div className={`flex items-center`}>
                          {column.label}
                          {renderFilter(column)}
                        </div>
                      </SortableHeader>
                    ) : (
                      <TableHead className={`text-center`}>
                        <div className="flex items-center">
                          {column.label}
                          {renderFilter(column)}
                        </div>
                      </TableHead>
                    )}
                  </React.Fragment>
                ))}
                {actions.length > 0 && (
                  <TableHead className="text-center">Ações</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items && data.items?.length > 0 ? (
                data.items.map((item, index) => (
                  <TableRow key={index} className="hover:bg-gray-50">
                    {selectable && (
                      <TableCell
                        key={"checkbox" + "_" + index.toString()}
                        className="flex justify-center items-center text-center py-8.5"
                      >
                        <Checkbox
                          checked={isItemChecked(item.id)}
                          className=""
                          onCheckedChange={(e) => {
                            handleChangeSelectedItems(item, e.valueOf());
                          }}
                        />
                      </TableCell>
                    )}

                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        className={`${
                          column.align == undefined
                            ? "text-center"
                            : column.align == "center"
                            ? "text-center"
                            : column.align == "right"
                            ? "text-right"
                            : "text-left"
                        }`}
                      >
                        {column.render
                          ? column.render(item)
                          : (item as any)[column.key]}
                      </TableCell>
                    ))}
                    {actions.length > 0 && (
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="cursor-pointer"
                            >
                              <EllipsisVertical />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {actions
                              .filter(
                                (action) => !action.show || action.show(item)
                              )
                              .map((action, index) => (
                                <DropdownMenuItem
                                  key={index}
                                  onClick={() => action.onClick(item)}
                                  className={
                                    action.variant === "destructive"
                                      ? "text-red-600 focus:text-red-600"
                                      : ""
                                  }
                                >
                                  <action.icon className="w-4 h-4 mr-2" />
                                  {typeof action.label == "string"
                                    ? action.label
                                    : action.label(item)}
                                </DropdownMenuItem>
                              ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow className="hover:bg-gray-50 text-center w-full">
                  <TableCell
                    className="p-6"
                    colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-gray-600 overflow-x-auto">
        {selectable && (
          <span className="ml-2">
            {selectedItems.length} itens selecionados
          </span>
        )}

        <Select
          onValueChange={handlePageSizeChange}
          value={state.pageSize.toString()}
        >
          <SelectTrigger className="w-fit">
            <SelectValue placeholder={state.pageSize.toString()} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1</SelectItem>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <span className="mr-2 text-center">
            {startRange}-{endRange} de {totalItems} registros
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={isPreviousDisabled}
            onClick={() => handlePageChange(state.page - 1)}
          >
            {isMd ? "Anterior" : <ChevronLeft />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isNextDisabled}
            onClick={() => handlePageChange(state.page + 1)}
          >
            {isMd ? "Seguinte" : <ChevronRight />}
          </Button>
        </div>
      </div>
    </div>
  );
}
