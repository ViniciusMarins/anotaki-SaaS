import { Calendar, Filter, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Calendar as CalendarComponent } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import type { FilterConfig } from "../data-table/generic-data-table";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

interface DateRangeFilterProps {
  filterConfig: FilterConfig;
  setFilterConfig: any;
  field: string;
}

export default function DateRangeFilter({
  filterConfig,
  setFilterConfig,
  field,
}: DateRangeFilterProps) {
  const [date, setDate] = useState<DateRange | undefined>();
  const [isOpen, setIsOpen] = useState(false);

  const currentFilter = filterConfig.field === field ? filterConfig.value : "";
  const hasActiveFilter = currentFilter !== "";

  const handleApplyFilter = () => {
    if (date?.from && date?.to) {
      const startDate = format(date.from, "yyyy-MM-dd");
      const endDate = format(date.to, "yyyy-MM-dd");
      const filterValue = `${startDate},${endDate}`;
      setFilterConfig({ field, value: filterValue });
      setIsOpen(false);
    }
  };

  const handleClearFilter = () => {
    setDate(undefined);
    setFilterConfig({ field: "", value: "" });
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (!hasActiveFilter) return null;

    const dates = currentFilter.split(",");
    if (dates.length === 2) {
      try {
        const start = new Date(dates[0]);
        const end = new Date(dates[1]);
        return `${format(start, "dd/MM/yyyy", { locale: ptBR })} - ${format(
          end,
          "dd/MM/yyyy",
          { locale: ptBR }
        )}`;
      } catch {
        return "Data inválida";
      }
    }
    return null;
  };

  const setQuickFilter = (days: number) => {
    const today = new Date();
    const pastDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
    setDate({ from: pastDate, to: today });
  };

  const setTodayFilter = () => {
    const today = new Date();
    setDate({ from: today, to: today });
  };

  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={(value) => {
        if (!value && date?.from && date?.to) {
          handleApplyFilter();
        }
        setIsOpen(value);
      }}
    >
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-1 cursor-pointer">
          <Filter
            className={`ml-1 size-4 ${
              hasActiveFilter ? "text-primary" : "text-gray-400"
            }`}
          />
          {hasActiveFilter && (
            <span className="text-xs text-primary font-normal">
              {getDisplayText()}
            </span>
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-auto p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4" />
              Filtrar por Período
            </h4>
            {(hasActiveFilter || (date?.from && date?.to)) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilter}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>

          {/* Date Range Picker */}
          <div className="space-y-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left text-sm",
                    !date && "text-muted-foreground"
                  )}
                >
                  <Calendar className="size-3" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                        {format(date.to, "dd/MM/yyyy", { locale: ptBR })}
                      </>
                    ) : (
                      format(date.from, "dd/MM/yyyy", { locale: ptBR })
                    )
                  ) : (
                    <span>Selecione o período</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                side="bottom"
                className="w-auto p-0 max-h-[250px] overflow-y-auto custom-scroll"
              >
                <CalendarComponent
                  autoFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={1}
                  fixedWeeks={false}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Filtros rápidos */}
          <div className="border-t pt-3 space-y-2">
            <p className="text-sm font-medium">Filtros Rápidos:</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={setTodayFilter}
                className="text-xs"
              >
                Hoje
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuickFilter(7)}
                className="text-xs"
              >
                7 dias
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuickFilter(30)}
                className="text-xs"
              >
                30 dias
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuickFilter(90)}
                className="text-xs"
              >
                90 dias
              </Button>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
