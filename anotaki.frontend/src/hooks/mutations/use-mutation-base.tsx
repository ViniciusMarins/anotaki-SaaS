import { customToast } from "@/components/global/toast";
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";

interface MutationConfig<T = any> {
  fn?: (data: T) => Promise<any>;
  successMessage?: string;
  errorMessage?: string;
}

interface CustomMutationConfig<T = any> extends MutationConfig<T> {
  name: string; // Nome da mutation que será retornada
}

// Tipo para extrair os nomes das mutations customizadas
type CustomMutationsType<T extends readonly CustomMutationConfig[]> = {
  [K in T[number]["name"]]: UseMutationResult<any, Error, any, unknown>;
};

// Tipo base para as mutations padrão
type BaseMutations = {
  createMutation: UseMutationResult<any, Error, any, unknown>;
  updateMutation: UseMutationResult<any, Error, any, unknown>;
  deleteMutation: UseMutationResult<any, Error, any, unknown>;
};

interface MutationBaseProps<T extends readonly CustomMutationConfig[] = []> {
  create?: MutationConfig;
  update?: MutationConfig;
  delete?: MutationConfig;
  queryKey: string | string[];
  customMutations?: T;
}

export function useMutationBase<T extends readonly CustomMutationConfig[]>({
  create,
  update,
  delete: deleteCfg,
  queryKey,
  customMutations,
}: MutationBaseProps<T>): BaseMutations & CustomMutationsType<T> {
  const queryClient = useQueryClient();

  const invalidateQueries = () => {
    queryClient.invalidateQueries({
      queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    });
  };

  const createMutation = useMutation({
    mutationFn: create?.fn,
    onSuccess: () => {
      invalidateQueries();
      customToast.success(
        create?.successMessage || "Registro criado com sucesso!"
      );
    },
    onError: (error: Error) => {
      customToast.error(
        create?.errorMessage || `Erro ao criar registro: ${error.message}`
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: update?.fn,
    onSuccess: () => {
      invalidateQueries();
      customToast.success(
        update?.successMessage || "Registro atualizado com sucesso!"
      );
    },
    onError: (error: Error) => {
      customToast.error(
        update?.errorMessage || `Erro ao atualizar registro: ${error.message}`
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCfg?.fn,
    onSuccess: () => {
      invalidateQueries();
      customToast.success(
        deleteCfg?.successMessage || "Registro deletado com sucesso!"
      );
    },
    onError: (error: Error) => {
      customToast.error(
        deleteCfg?.errorMessage || `Erro ao deletar registro: ${error.message}`
      );
    },
  });

  // mutations customizadas dinamicamente
  const dynamicMutations = customMutations?.reduce((acc, config) => {
    const mutation = useMutation({
      mutationFn: config?.fn,
      onSuccess: () => {
        invalidateQueries();
        if (config.successMessage) {
          customToast.success(config.successMessage);
        }
      },
      onError: (error: Error) => {
        if (config.errorMessage) {
          customToast.error(config.errorMessage);
        } else {
          customToast.error(`Erro na operação: ${error.message}`);
        }
      },
    });

    acc[config.name] = mutation;
    return acc;
  }, {} as Record<string, UseMutationResult>);

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    ...dynamicMutations,
  } as BaseMutations & CustomMutationsType<T>;
}
