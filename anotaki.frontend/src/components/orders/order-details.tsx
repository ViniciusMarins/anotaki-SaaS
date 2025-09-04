import {
  AlertCircle,
  ArrowLeft,
  CreditCard,
  MapPin,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { OrderStatus, type Order } from "@/types";

import {
  getOrderStatusChip,
  getOrderStatusColors,
} from "@/components/orders/orders-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatDateWithoutTime,
  formatDateWithTime,
  formatPriceWithCurrencyStyle,
} from "@/lib/utils";

interface OrderDetailsProps {
  order: Order;
  onBack?: () => void;
  onRepeatOrder?: (orderId: number) => void;
}

export default function OrderDetails({ order, onBack }: OrderDetailsProps) {
  return (
    <main className="p-6">
      {/* Header */}
      <div className="flex flex-col my-b">
        <h1 className="text-xl font-semibold">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          Pedido #{order.id}
        </h1>
        <p className="text-gray-600 pl-9">
          Em {formatDateWithoutTime(order.createdAt)}
        </p>
      </div>

      <Separator className="my-4" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Status</CardTitle>
              {getOrderStatusChip(order.orderStatus)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              {order.logs &&
                order.logs.map((log, index) => {
                  const statusColors = getOrderStatusColors(log.status);
                  const isLast = index === order.logs.length - 1;

                  return (
                    <div key={log.id} className="flex items-start gap-3">
                      {/* Timeline column */}
                      <div className="flex flex-col items-center pt-1">
                        <div
                          className={`w-3 h-3 ${statusColors.dot} rounded-full border-2 border-white shadow-sm z-10 relative `}
                        >
                          {isLast &&
                            log.status != OrderStatus.Delivered &&
                            log.status != OrderStatus.Cancelled && (
                              <div className="absolute size-3 rounded-full animate-ping bg-white transition-colors" />
                            )}
                        </div>
                        {!isLast && (
                          <div className="w-0.5 h-5 bg-gray-200 mt-1" />
                        )}
                      </div>

                      <div className="flex-1 pb-5">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium text-gray-800">
                            {formatDateWithTime(log.createdAt)}
                          </span>
                          <span className="mx-2">•</span>
                          <span>{log.description}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* Delivery Information */}
        {order.address && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Endereço de entrega
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  {order.address?.street}, {order.address?.number}
                </p>
                <p>{order.address?.neighborhood}</p>
                {order.address?.complement && (
                  <p>{order.address?.complement}</p>
                )}
                <p>
                  {order.address?.city} - {order.address?.state}
                </p>
                <p>CEP: {order.address?.zipCode}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Items */}
        <div className="col-span-1 lg:col-span-2">
          {/* Payment Information */}
          {order.paymentMethod && (
            <Card className="rounded-br-none rounded-bl-none border-b-0">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Forma de pagamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-900">
                    {order.paymentMethod?.name}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="rounded-tr-none rounded-tl-none">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Itens do pedido
              </CardTitle>
              <p className="text-sm text-gray-600 flex items-center gap-2 my-2">
                <AlertCircle className="size-4 shrink-0 text-red-500" />{" "}
                <span className="font-semibold">Observações:</span>{" "}
                {order.notes}
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-10">
                {order.items &&
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
                                        extraItem.unitPrice
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
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <Card className="col-span-1 lg:col-span-2">
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-primary font-bold text-xl">
                  {formatPriceWithCurrencyStyle(order.totalPrice)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
