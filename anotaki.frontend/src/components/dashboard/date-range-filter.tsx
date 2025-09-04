import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import React, { useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { Calendar, X } from "lucide-react";

import { Calendar as CalendarComponent } from "@/components/ui/calendar";

export default function DateRangeFilter({
  onDateRangeChange,
}: {
  onDateRangeChange: (range: DateRange | undefined) => void;
}) {
  const [date, setDate] = useState<DateRange | undefined>();
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilter = date?.from && date?.to;

  const handleApplyFilter = () => {
    if (date?.from && date?.to) {
      onDateRangeChange(date);
      setIsOpen(false);
    }
  };

  const handleClearFilter = () => {
    setDate(undefined);
    onDateRangeChange(undefined);
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (!hasActiveFilter) return null;
    try {
      return `${format(date.from!, "dd/MM/yyyy", { locale: ptBR })} - ${format(
        date.to!,
        "dd/MM/yyyy",
        { locale: ptBR }
      )}`;
    } catch {
      return "Data inválida";
    }
  };

  const setQuickFilter = (days: number) => {
    const today = new Date();
    const pastDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
    const newDate = { from: pastDate, to: today };
    setDate(newDate);
    onDateRangeChange(newDate);
  };

  const setTodayFilter = () => {
    const today = new Date();
    const newDate = { from: today, to: today };
    setDate(newDate);
    onDateRangeChange(newDate);
  };

  const setCurrentWeekFilter = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const newDate = { from: monday, to: today };
    setDate(newDate);
    onDateRangeChange(newDate);
  };

  // Aplicar filtro da semana atual por padrão
  React.useEffect(() => {
    setCurrentWeekFilter();
  }, []);

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
        <Button variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" />
          {hasActiveFilter ? getDisplayText() : "Selecionar período"}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-auto p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4" />
              Filtrar por Período
            </h4>
            {hasActiveFilter && (
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
                className="w-auto p-0 max-h-[250px] overflow-y-auto"
              >
                <CalendarComponent
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={1}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

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
                onClick={setCurrentWeekFilter}
                className="text-xs"
              >
                Esta semana
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
