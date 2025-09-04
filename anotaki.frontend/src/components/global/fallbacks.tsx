import { SearchX } from "lucide-react";

export const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen max-w-[2560px] mx-auto">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
};

export const NotFoundPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen max-w-[2560px] mx-auto">
      <div className="text-center">
        <SearchX className="mx-auto mb-4 size-10 text-red-400" />
        <p className="text-muted-foreground">
          Não foi possível encontrar nenhuma página com esse endereço.
        </p>
      </div>
    </div>
  );
};
