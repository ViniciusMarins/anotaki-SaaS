import { CreditCard, MapPin, Package, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatPriceWithCurrencyStyle } from "@/lib/utils";
import { type CartDTO, type CheckoutOrderDTO } from "@/types";
import { useAuth } from "@/context/use-auth";
import { GetPaymentMethods } from "@/api/_requests/paymentMethods";
import { GetCart } from "@/api/_requests/orders";
import { useWindowSize } from "usehooks-ts";
import AddressModal from "@/components/addresses/address-modal";
import { useDeleteAddress } from "@/hooks/mutations/use-address-mutation";
import { customToast } from "@/components/global/toast";
import { useOrderCheckout } from "@/hooks/mutations/use-cart-mutations";
import { useNavigate } from "react-router-dom";
import { Loading } from "@/components/global/fallbacks";

export default function OrderCheckout() {
  const { data: cart, isLoading } = useQuery({
    queryKey: ["get-cart"],
    queryFn: GetCart,
  });

  const checkoutOrderMutation = useOrderCheckout();
  const navigate = useNavigate();

  const handleConfirmOrder = async (payload: CheckoutOrderDTO) => {
    await checkoutOrderMutation.mutateAsync(payload, {
      onSuccess: () => {
        customToast.success("Pedido criado com sucesso!");
        navigate(`/my-orders/${cart?.id}`);
      },
      onError: () => {
        customToast.error("Ocorreu um erro ao processar o pedido.");
      },
    });
  };

  if (isLoading) return <Loading />;
  if (!cart) return <div>Pedido não encontrado</div>;

  return (
    <div className="max-w-5xl w-full mx-auto">
      <OrderCheckoutDetails
        order={cart}
        onConfirmOrder={handleConfirmOrder}
        onBack={() => {}}
      />
    </div>
  );
}

interface OrderCheckoutDetailsProps {
  order: CartDTO;
  onBack?: () => void;
  onConfirmOrder?: (payload: CheckoutOrderDTO) => void;
}

export function OrderCheckoutDetails({
  order,
  onBack,
  onConfirmOrder,
}: OrderCheckoutDetailsProps) {
  const { user, setUser } = useAuth();
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<
    number | null
  >(null);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null
  );
  const { width } = useWindowSize();

  const deleteAddressMutation = useDeleteAddress();

  const { data: paymentMethods, isLoading: isLoadingPaymentMethods } = useQuery(
    {
      queryKey: ["payment-methods"],
      queryFn: GetPaymentMethods,
    }
  );

  const enableConfirmOrder =
    selectedPaymentMethodId &&
    selectedAddressId &&
    onConfirmOrder &&
    order.items?.length > 0;

  const handleConfirmOrder = () => {
    if (enableConfirmOrder) {
      onConfirmOrder({
        paymentMethodId: selectedPaymentMethodId,
        addressId: selectedAddressId,
        notes: "",
      });
    }
  };

  const handleDeleteAddress = async (id: number) => {
    await deleteAddressMutation.mutateAsync(id, {
      onSuccess: () => {
        customToast.success("Endereço deletado com sucesso!");
        if (user)
          setUser({
            ...user,
            addresses: user.addresses.filter((x) => x.id != id),
          });
      },
      onError: () => {
        customToast.error("Já existem pedidos com este endereço.");
      },
    });
  };

  return (
    <main className="p-6">
      {/* Header */}
      <div className="flex flex-col my-4">
        <h1 className="text-xl font-semibold">
          {/* {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )} */}
          Finalizar Pedido
        </h1>
        <p className="text-gray-600">
          Revise seus itens e escolha forma de pagamento e endereço
        </p>
      </div>

      <Separator className="my-4" />

      <div className="grid grid-cols-1 gap-4">
        {/* Delivery Address Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Endereço de entrega
              </CardTitle>

              <AddressModal width={width} />
            </div>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedAddressId?.toString()}
              onValueChange={(value) => setSelectedAddressId(parseInt(value))}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {user?.addresses?.map((address) => (
                <div
                  key={address.id}
                  className="flex items-start space-x-2 border-[1px] border-gray-200 p-3 rounded-xl hover:bg-gray-100/40 transition-colors duration-150 relative"
                >
                  <div
                    onClick={() => handleDeleteAddress(address.id)}
                    className="absolute top-3 right-3"
                  >
                    <Trash className="text-red-500 size-4 cursor-pointer hover:text-red-400" />
                  </div>

                  <RadioGroupItem
                    value={address.id.toString()}
                    id={`address-${address.id}`}
                    className="mt-1"
                  />
                  <Label
                    htmlFor={`address-${address.id}`}
                    className="flex-1 wrap-anywhere"
                  >
                    <div className="text-sm text-gray-600 space-y-1">
                      <p className="font-medium text-gray-800">
                        {address.street}, {address.number}
                      </p>
                      <p>{address.neighborhood}</p>
                      {address.complement && <p>{address.complement} </p>}
                      <p>
                        {address.city} - {address.state}
                      </p>
                      <p>CEP: {address.zipCode}</p>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Payment Methods Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Forma de pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingPaymentMethods ? (
              <div>Carregando métodos de pagamento...</div>
            ) : (
              <RadioGroup
                value={selectedPaymentMethodId?.toString()}
                onValueChange={(value) =>
                  setSelectedPaymentMethodId(parseInt(value))
                }
              >
                {paymentMethods?.map((paymentMethod) => (
                  <div
                    key={paymentMethod.id}
                    className="flex items-center space-x-2"
                  >
                    <RadioGroupItem
                      value={paymentMethod.id.toString()}
                      id={`payment-${paymentMethod.id}`}
                    />
                    <Label
                      htmlFor={`payment-${paymentMethod.id}`}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <CreditCard className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-900">
                        {paymentMethod.name}
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </CardContent>
        </Card>

        {/* Order Items */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Itens do pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-10">
                {order.items && order.items.length > 0 ? (
                  order.items?.map((item) => (
                    <div key={item.id} className="flex items-start gap-4">
                      {item.product?.imageData && (
                        <img
                          src={`data:${item.product?.imageMimeType};base64,${item.product?.imageData}`}
                          alt={item.product?.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
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
                                      {extraItem.quantity}x{" "}
                                      {extraItem.extra?.name} (+
                                      {formatPriceWithCurrencyStyle(
                                        extraItem.extra?.price
                                      )}
                                      )
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {item.notes && (
                              <p className="text-sm text-gray-600 mt-1">
                                Obs: {item.notes}
                              </p>
                            )}
                          </div>
                          <span className="text-base text-gray-900">
                            {formatPriceWithCurrencyStyle(item.totalPrice)}
                          </span>
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
        </div>

        {/* Order Summary and Confirm Button */}
        <Card>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-primary font-bold text-xl">
                  {formatPriceWithCurrencyStyle(order.totalPrice)}
                </span>
              </div>
              <Button
                onClick={handleConfirmOrder}
                disabled={!!!enableConfirmOrder}
                className="w-full"
                size="lg"
              >
                Confirmar Pedido
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
