export const CustomOrdersGraphTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm md:text-base">
        <div className="grid gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              {label}
            </span>
            <span className="font-bold text-muted-foreground">
              Pedidos: {payload[0]?.payload?.totalOrders?.toLocaleString()}
            </span>
            <span className="font-bold text-muted-foreground">
              Receita:{" "}
              <span className="text-green-500 font-bold">
                {payload[0]?.payload?.totalRevenue?.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const CustomProductsGraphTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm md:text-base">
        <div className="grid gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              {payload[0]?.payload?.name?.toLocaleString()}
            </span>
            <span className="font-bold text-muted-foreground">
              Pedidos: {payload[0]?.payload?.salesCount?.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};
