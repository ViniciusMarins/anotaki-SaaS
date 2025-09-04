import { ArrowRight, Minus, Package, Plus, Trash } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GetCart } from "@/api/_requests/orders";
import { formatPriceWithCurrencyStyle } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useChangeProductCartQuantity } from "@/hooks/mutations/use-cart-mutations";
import { ChangeProductQuantityOperations } from "@/types";
import { customToast } from "@/components/global/toast";
import { Loading } from "@/components/global/fallbacks";

export default function UserCart() {
  const queryClient = useQueryClient();
  const changeProductQuantityMutation = useChangeProductCartQuantity();

  const { data: cart, isLoading } = useQuery({
    queryKey: ["get-cart"],
    queryFn: GetCart,
  });

  if (isLoading) return <Loading />;
  if (!cart) return <div>Carrinho não encontrado</div>;

  async function handleChangeProductQuantity(
    itemId: number,
    operation: ChangeProductQuantityOperations
  ) {
    await changeProductQuantityMutation.mutateAsync(
      {
        itemId,
        operation,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["get-cart"] });
        },
        onError: () => {
          customToast.error("Erro ao mudar quantidade do item.");
        },
      }
    );
  }

  return (
    <div className="max-w-5xl w-full mx-auto">
      <main className="p-6 pt-10">
        {/* Header */}
        <div className="flex justify-between sm:items-center flex-col sm:flex-row gap-3">
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold">Carrinho</h1>
            <p className="text-gray-600">Revise os itens adicionados ao seu carrinho</p>
          </div>

          <Link to={"checkout"}>
            <Button className="flex gap-2 items-center">
              Finalizar o pedido
              <ArrowRight />
            </Button>
          </Link>
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-1 gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Itens do pedido
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent>
              <div className="flex flex-col gap-10">
                {cart.items && cart.items.length > 0 ? (
                  cart.items?.map((item) => (
                    <div key={item.id} className="flex items-start gap-4">
                      {item.product?.imageData && (
                        <img
                          src={`data:${item.product?.imageMimeType};base64,${item.product?.imageData}`}
                          alt={item.product?.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}

                      <div className="flex justify-between items-start flex-col sm:flex-row w-full">
                        <div>
                          <h4 className="text-gray-900 text-sm font-semibold">
                            {item.quantity}x {item.product?.name}
                          </h4>

                          {item.extrasItems?.length > 0 && (
                            <div className="text-sm text-gray-600 mt-1">
                              <p>Extras:</p>
                              <ul className="list-disc list-inside ml-2">
                                {item.extrasItems?.map((extraItem) => (
                                  <li key={extraItem.id}>
                                    {extraItem.quantity}x {extraItem.extra?.name}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {item.notes && (
                            <p className="text-sm text-gray-600 mt-1">Obs: {item.notes}</p>
                          )}
                        </div>

                        <div className="text-sm text-gray-900 flex items-center min-w-[180px]">
                          <Button
                            variant="ghost"
                            disabled={changeProductQuantityMutation.isPending}
                            className="rounded-full cursor-pointer mr-auto"
                            onClick={() =>
                              handleChangeProductQuantity(
                                item.id,
                                ChangeProductQuantityOperations.Sub
                              )
                            }
                          >
                            {item.quantity == 1 ? (
                              <Trash className="size-4 text-red-500" />
                            ) : (
                              <Minus className="size-4" />
                            )}
                          </Button>

                          <span className="text-base w-full text-center">
                            {formatPriceWithCurrencyStyle(item.totalPrice)}
                          </span>

                          <Button
                            variant="ghost"
                            disabled={changeProductQuantityMutation.isPending}
                            className="rounded-full cursor-pointer ml-auto"
                            onClick={() =>
                              handleChangeProductQuantity(
                                item.id,
                                ChangeProductQuantityOperations.Add
                              )
                            }
                          >
                            <Plus className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-start gap-4 justify-center">
                    Nenhum item foi adicionado ao carrinho ainda.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="flex justify-between gap-4 text-lg font-semibold">
                <span>Total</span>
                <span className="text-primary font-bold text-xl">
                  {formatPriceWithCurrencyStyle(cart.totalPrice)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
