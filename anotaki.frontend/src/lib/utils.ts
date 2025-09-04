import type { WorkingHoursDto } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const daysMap = {
  sunday: "Domingo",
  monday: "Segunda",
  tuesday: "Terça",
  wednesday: "Quarta",
  thursday: "Quinta",
  friday: "Sexta",
  saturday: "Sábado",
};

export const monthsMap = {
  january: "Janeiro",
  february: "Fevereiro",
  march: "Março",
  april: "Abril",
  may: "Maio",
  june: "Junho",
  july: "Julho",
  august: "Agosto",
  september: "Setembro",
  october: "Outubro",
  november: "Novembro",
  december: "Dezembro",
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Função para validar CPF
export const validateCPF = (cpf: string): boolean => {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, "");

  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += Number.parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== Number.parseInt(cleanCPF.charAt(9))) return false;

  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += Number.parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== Number.parseInt(cleanCPF.charAt(10))) return false;

  return true;
};

// Função para formatar CPF
export const formatCPF = (cpf: string) => {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

// Função para formatar data
export const formatDateWithoutTime = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const formatDateWithTime = (dateString: string) => {
  return new Date(dateString).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Função para formatar preço
export const formatPriceWithCurrencyStyle = (price: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);
};

// Função para formatar CEP
export const formatZipCode = (value: string) => {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 5) {
    return numbers;
  }
  return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
};

// Função para formatar horários
export const formatWorkingHours = (workingHours: WorkingHoursDto[]) => {
  const daysMap = {
    monday: "Segunda",
    tuesday: "Terça",
    wednesday: "Quarta",
    thursday: "Quinta",
    friday: "Sexta",
    saturday: "Sábado",
    sunday: "Domingo",
  };

  return workingHours
    .filter((wh) => wh.isOpen)
    .map((wh) => ({
      day: daysMap[wh.dayOfWeek as keyof typeof daysMap],
      hours: `${wh.startTime} - ${wh.endTime}`,
    }));
};

export const isStoreOpenNow = (workingHours: WorkingHoursDto[]): boolean => {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = domingo, 1 = segunda, etc.
  const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"

  const dayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  const todayName = dayNames[currentDay];

  const todayHours = workingHours.find((wh) => wh.dayOfWeek === todayName);

  if (!todayHours || !todayHours.isOpen) {
    return false;
  }

  return (
    currentTime >= todayHours.startTime! && currentTime <= todayHours.endTime!
  );
};

export const getNextOpeningTime = (
  workingHours: WorkingHoursDto[]
): string | null => {
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = now.toTimeString().slice(0, 5);

  const dayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const daysMap = {
    sunday: "Domingo",
    monday: "Segunda",
    tuesday: "Terça",
    wednesday: "Quarta",
    thursday: "Quinta",
    friday: "Sexta",
    saturday: "Sábado",
  };

  // Verificar se ainda vai abrir hoje
  const todayName = dayNames[currentDay];
  const todayHours = workingHours.find((wh) => wh.dayOfWeek === todayName);

  if (todayHours?.isOpen && currentTime < todayHours.startTime!) {
    return `Hoje às ${todayHours.startTime}`;
  }

  // Procurar próximo dia que abre
  for (let i = 1; i <= 7; i++) {
    const nextDayIndex = (currentDay + i) % 7;
    const nextDayName = dayNames[nextDayIndex];
    const nextDayHours = workingHours.find(
      (wh) => wh.dayOfWeek === nextDayName
    );

    if (nextDayHours?.isOpen) {
      const dayLabel =
        i === 1 ? "Amanhã" : daysMap[nextDayName as keyof typeof daysMap];
      return `${dayLabel} às ${nextDayHours.startTime}`;
    }
  }

  return null;
};
