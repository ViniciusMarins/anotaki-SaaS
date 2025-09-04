import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { customToast } from "@/components/global/toast";
import { Circle, MapPin, Clock, Copy } from "lucide-react";
import { GetStoreSettings, UpdateStoreSettings } from "@/api/_requests/users";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatZipCode } from "@/lib/utils";

const workingHoursSchema = z.object({
  dayOfWeek: z.string(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  isOpen: z.boolean(),
});

const storeSettingsSchema = z.object({
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(1, "Estado é obrigatório"),
  zipCode: z
    .string()
    .min(1, "CEP é obrigatório")
    .regex(/^\d{5}-?\d{3}$/, "CEP deve estar no formato 00000-000"),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  street: z.string().min(1, "Rua é obrigatória"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  workingHours: z.array(workingHoursSchema),
});

export type StoreSettingsFormData = z.infer<typeof storeSettingsSchema>;

const daysOfWeekMap = {
  monday: "Segunda-feira",
  tuesday: "Terça-feira",
  wednesday: "Quarta-feira",
  thursday: "Quinta-feira",
  friday: "Sexta-feira",
  saturday: "Sábado",
  sunday: "Domingo",
};

export default function AdminStoreSettings() {
  const queryClient = useQueryClient();

  const { data: storeSettings, isLoading: isStoreSettingsLoading } = useQuery({
    queryKey: ["storeSettings"],
    queryFn: () => GetStoreSettings(),
    staleTime: 30000,
  });

  const updateStoreSettingsMutation = useMutation({
    mutationKey: ["updateStoreSettings"],
    mutationFn: UpdateStoreSettings,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<StoreSettingsFormData>({
    resolver: zodResolver(storeSettingsSchema),
    defaultValues: {
      workingHours: [
        { dayOfWeek: "monday", startTime: "", endTime: "", isOpen: false },
        { dayOfWeek: "tuesday", startTime: "", endTime: "", isOpen: false },
        { dayOfWeek: "wednesday", startTime: "", endTime: "", isOpen: false },
        { dayOfWeek: "thursday", startTime: "", endTime: "", isOpen: false },
        { dayOfWeek: "friday", startTime: "", endTime: "", isOpen: false },
        { dayOfWeek: "saturday", startTime: "", endTime: "", isOpen: false },
        { dayOfWeek: "sunday", startTime: "", endTime: "", isOpen: false },
      ],
    },
  });

  const { fields, update } = useFieldArray({
    control,
    name: "workingHours",
  });

  const watchedWorkingHours = watch("workingHours");

  useEffect(() => {
    if (storeSettings) {
      setValue("city", storeSettings.city || "");
      setValue("state", storeSettings.state || "");
      setValue("zipCode", storeSettings.zipCode || "");
      setValue("neighborhood", storeSettings.neighborhood || "");
      setValue("street", storeSettings.street || "");
      setValue("number", storeSettings.number || "");
      setValue("complement", storeSettings.complement || "");

      if (storeSettings.workingHours && storeSettings.workingHours.length > 0) {
        setValue("workingHours", storeSettings.workingHours);
      }
    }
  }, [storeSettings, setValue]);

  const onSubmit = (data: StoreSettingsFormData) => {
    const formData = {
      id: storeSettings?.id || 0,
      ...data,
    };

    updateStoreSettingsMutation.mutate(formData, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["storeSettings"] });
        customToast.success("Configurações da loja atualizadas com sucesso!");
      },
      onError: () => {
        customToast.error("Erro ao atualizar configurações. Tente novamente.");
      },
    });
  };

  const applyToAll = (
    isOpen: boolean,
    startTime?: string,
    endTime?: string
  ) => {
    if (!startTime || !endTime) return;

    fields.forEach((field, index) => {
      update(index, {
        ...field,
        startTime: startTime,
        endTime: endTime,
        isOpen: isOpen,
      });
    });
  };

  if (isStoreSettingsLoading) {
    return (
      <main className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center">
            <Circle className="animate-spin mr-3 h-6 w-6 text-primary" />
            <span>Carregando configurações...</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-semibold">
          Gerenciamento das configurações da loja
        </h1>
      </div>

      <div className="space-y-8">
        {/* Horários de Funcionamento */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <h3 className="text-lg font-medium">Horários de Funcionamento</h3>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            {fields.map((field, index) => {
              return (
                <div
                  key={field.id}
                  className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-4 items-center py-2"
                >
                  <div className="flex items-center gap-2 ">
                    <Switch
                      className="cursor-pointer"
                      checked={watchedWorkingHours[index]?.isOpen || false}
                      onCheckedChange={(checked: boolean) => {
                        setValue(`workingHours.${index}.isOpen`, checked);
                        if (!checked) {
                          setValue(`workingHours.${index}.startTime`, "");
                          setValue(`workingHours.${index}.endTime`, "");
                        }
                      }}
                    />
                    <Label className="text-sm font-medium min-w-[100px]">
                      {
                        daysOfWeekMap[
                          field.dayOfWeek as keyof typeof daysOfWeekMap
                        ]
                      }
                    </Label>
                  </div>

                  <div className="flex gap-2">
                    <div className="grow">
                      <Label className="text-xs text-gray-500">Abertura</Label>
                      <Input
                        type="time"
                        disabled={!watchedWorkingHours[index]?.isOpen}
                        className="text-sm"
                        {...register(`workingHours.${index}.startTime`)}
                      />
                    </div>

                    <div className="grow">
                      <Label className="text-xs text-gray-500">
                        Fechamento
                      </Label>
                      <Input
                        type="time"
                        disabled={!watchedWorkingHours[index]?.isOpen}
                        className="text-sm"
                        {...register(`workingHours.${index}.endTime`)}
                      />
                    </div>
                    {watchedWorkingHours[index]?.startTime &&
                      watchedWorkingHours[index]?.endTime && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className="cursor-pointer"
                              onClick={() =>
                                applyToAll(
                                  watchedWorkingHours[index]?.isOpen,
                                  watchedWorkingHours[index]?.startTime,
                                  watchedWorkingHours[index]?.endTime
                                )
                              }
                            >
                              <Copy className="size-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Replicar esse horário para todos os dias</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                  </div>

                  <div className="text-xs text-gray-500">
                    {watchedWorkingHours[index]?.isOpen
                      ? watchedWorkingHours[index]?.startTime &&
                        watchedWorkingHours[index]?.endTime
                        ? `${watchedWorkingHours[index].startTime} - ${watchedWorkingHours[index].endTime}`
                        : "Defina os horários"
                      : "Fechado"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Endereço */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <h3 className="text-lg font-medium">Endereço da Loja</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* CEP */}
            <div className="space-y-2">
              <Label htmlFor="zipCode">CEP</Label>
              <Input
                id="zipCode"
                type="text"
                maxLength={9}
                placeholder="00000-000"
                className={errors.zipCode ? "border-red-500" : ""}
                disabled={updateStoreSettingsMutation.isPending}
                {...register("zipCode")}
                onChange={(e) => {
                  e.target.value = formatZipCode(e.target.value);
                }}
              />
              {errors.zipCode && (
                <p className="text-red-500 text-xs">{errors.zipCode.message}</p>
              )}
            </div>

            {/* Cidade */}
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                type="text"
                placeholder="Digite a cidade"
                className={errors.city ? "border-red-500" : ""}
                disabled={isStoreSettingsLoading}
                {...register("city")}
              />
              {errors.city && (
                <p className="text-red-500 text-xs">{errors.city.message}</p>
              )}
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                type="text"
                placeholder="Digite o estado"
                className={errors.state ? "border-red-500" : ""}
                disabled={isStoreSettingsLoading}
                {...register("state")}
              />
              {errors.state && (
                <p className="text-red-500 text-xs">{errors.state.message}</p>
              )}
            </div>

            {/* Bairro */}
            <div className="space-y-2">
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input
                id="neighborhood"
                type="text"
                placeholder="Digite o bairro"
                className={errors.neighborhood ? "border-red-500" : ""}
                disabled={isStoreSettingsLoading}
                {...register("neighborhood")}
              />
              {errors.neighborhood && (
                <p className="text-red-500 text-xs">
                  {errors.neighborhood.message}
                </p>
              )}
            </div>

            {/* Rua */}
            <div className="space-y-2">
              <Label htmlFor="street">Rua</Label>
              <Input
                id="street"
                type="text"
                placeholder="Digite o nome da rua"
                className={errors.street ? "border-red-500" : ""}
                disabled={isStoreSettingsLoading}
                {...register("street")}
              />
              {errors.street && (
                <p className="text-red-500 text-xs">{errors.street.message}</p>
              )}
            </div>

            {/* Número */}
            <div className="space-y-2">
              <Label htmlFor="number">Número</Label>
              <Input
                id="number"
                type="text"
                placeholder="123"
                className={errors.number ? "border-red-500" : ""}
                disabled={isStoreSettingsLoading}
                {...register("number")}
              />
              {errors.number && (
                <p className="text-red-500 text-xs">{errors.number.message}</p>
              )}
            </div>

            {/* Complemento */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="complement">Complemento (opcional)</Label>
              <Input
                id="complement"
                type="text"
                placeholder="Apartamento, sala, andar..."
                className={errors.complement ? "border-red-500" : ""}
                disabled={isStoreSettingsLoading}
                {...register("complement")}
              />
              {errors.complement && (
                <p className="text-red-500 text-xs">
                  {errors.complement.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Botão de Submit */}
        <div className="flex justify-end pt-4 sticky bottom-4">
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={updateStoreSettingsMutation.isPending}
            className={`flex justify-center py-2 px-6 border border-transparent text-sm font-medium rounded-md text-white ${
              updateStoreSettingsMutation.isPending
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            } transition-colors duration-200`}
          >
            {updateStoreSettingsMutation.isPending ? (
              <div className="flex items-center">
                <Circle className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" />
                Salvando...
              </div>
            ) : (
              "Salvar Configurações"
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
