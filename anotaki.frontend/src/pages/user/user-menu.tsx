import { useState } from "react";
import { User, SearchIcon, Info, Store } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GetMenu } from "@/api/_requests/products";
import MenuProductImage from "@/components/products/menu-product-image";
import MenuProductCard from "@/components/products/menu-product-card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { formatPriceWithCurrencyStyle, formatWorkingHours } from "@/lib/utils";
import { GetExtras } from "@/api/_requests/extras";
import type { AddProductToOrderDTO, Extra, Product } from "@/types";
import { Textarea } from "@/components/ui/textarea";
import { useAddToCart } from "@/hooks/mutations/use-cart-mutations";
import { customToast } from "@/components/global/toast";
import { Loading } from "@/components/global/fallbacks";
import { Input } from "@/components/ui/input";
import { GetStoreSettings } from "@/api/_requests/users";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { SecondaryText } from "@/components/design/secondary-text";

export default function MenuPage() {
  const queryClient = useQueryClient();
  const [selectedExtras, setSelectedExtras] = useState<Extra[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");

  const { data: menuData, isLoading } = useQuery({
    queryKey: ["menu", searchTerm],
    queryFn: () => GetMenu(searchTerm),
    staleTime: 0,
    gcTime: 0,
  });

  const { data: storeSettings } = useQuery({
    queryKey: ["storeSettings"],
    queryFn: () => GetStoreSettings(),
    staleTime: 30000,
  });

  const { data: extras, isLoading: isExtrasLoading } = useQuery({
    queryKey: ["extras"],
    queryFn: () => GetExtras(),
    staleTime: 30000,
  });

  const addToCartMutation = useAddToCart();

  const openProductDialog = (item: any) => {
    setSelectedProduct(item);
    setIsDialogOpen(true);
  };

  const handleExtraChange = (extra: Extra, checked: boolean) => {
    const currentExtras = selectedExtras;
    let newExtras;

    if (checked) {
      newExtras = [...currentExtras, extra];
    } else {
      newExtras = currentExtras.filter((e) => e.id !== extra.id);
    }

    setSelectedExtras(newExtras);
  };

  const addToCart = async () => {
    const payload: AddProductToOrderDTO = {
      productId: selectedProduct?.id ?? 0,
      notes,
      extras: selectedExtras.map((e) => {
        const value = {
          extraId: e.id,
          quantity: 1,
        };

        return value;
      }),
    };

    await addToCartMutation.mutateAsync(payload, {
      onSuccess: () => {
        setSelectedExtras([]);
        setSelectedProduct(null);
        setIsDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: ["get-cart"] });

        customToast.success("Produto adicionado com sucesso!");
      },
      onError: () => {},
    });
  };

  if (isLoading) return <Loading />;

  console.log(storeSettings?.workingHours);

  return (
    <div>
      {/* Header */}
      <header className="bg-primary text-white sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3 max-w-6xl w-full mx-auto">
          <div className="flex items-center space-x-3">
            <div className="size-10 bg-white rounded-full flex items-center justify-center">
              <img src="/anotaki_img.png" />
            </div>

            <h1 className="font-bold text-lg">Anotaki Delivery</h1>
          </div>
          <div className="flex items-center space-x-3">
            <Input
              name="searchTerm"
              className="bg-gray-100 text-black"
              Icon={SearchIcon}
              iconClassname="text-black"
              iconPosition="right"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setSearchTerm(inputValue);
                }
              }}
              iconOnClick={() => {
                setSearchTerm(inputValue);
              }}
            />
            <User className="w-5 h-5 cursor-pointer" />
          </div>
        </div>
      </header>

      {/* Status Banner */}
      <div className="bg-primary/10 h-full py-2 flex items-center justify-center">
        <div className="max-w-6xl w-full text-gray-500">
          <Dialog>
            <DialogTrigger className="flex items-center gap-1">
              <Button
                variant={"ghost"}
                className="rounded-full cursor-pointer p-5 hover:bg-white/50"
              >
                <Info className="size-5 shrink-0" />
                <p className="text-sm">Informações da loja</p>
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex gap-2 items-center">
                  <Store className="size-5 shrink-0" /> Informações da loja
                </DialogTitle>
              </DialogHeader>

              <div className="flex flex-col gap-3 mt-2">
                <div className="flex flex-col gap-2">
                  <SecondaryText className="text-base font-semibold">
                    Horários de funcionamento
                  </SecondaryText>
                  <div className="flex flex-col gap-1">
                    {storeSettings && storeSettings.workingHours ? (
                      <>
                        {formatWorkingHours(storeSettings.workingHours)?.map((wh) => (
                          <p className="text-black/70">
                            {wh.day}: {wh.hours}
                          </p>
                        ))}
                      </>
                    ) : (
                      <div>Horários de funcionamento indisponíveis para hoje.</div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <SecondaryText className="text-base font-semibold">Endereço</SecondaryText>

                  {storeSettings && (
                    <>
                      <p className="text-black/70">
                        Rua {storeSettings.street}, N° {storeSettings.number} -{" "}
                        {storeSettings.neighborhood} <br />
                        {storeSettings.city} - {storeSettings.state}, {storeSettings.zipCode}
                      </p>

                      <iframe
                        src={`https://www.google.com/maps?q=${encodeURIComponent(
                          `Rua ${storeSettings.street}, ${storeSettings.number}, ${storeSettings.city}, ${storeSettings.state}, ${storeSettings.zipCode}`
                        )}&output=embed`}
                        width="100%"
                        height="300"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      ></iframe>
                    </>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl w-full mx-auto mt-6">
        {/* Categories */}
        <div className="flex flex-col gap-4">
          {menuData?.map((session) => (
            <section
              key={session.name}
              className="bg-white px-4 py-6 border-[1px] border-gray-200 rounded-xl shadow-xs"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">{session.name}</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {session.products.map((product) => {
                  return (
                    <MenuProductCard
                      key={product.id}
                      product={product}
                      onCardClick={openProductDialog}
                      showSalesCount={session.name.includes("pedidos")}
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md mx-auto border-0">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  {selectedProduct.name}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="w-full h-40 bg-gray-100 rounded-lg overflow-hidden">
                  <MenuProductImage
                    product={selectedProduct}
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-base font-medium">
                  Descrição: <span className="text-black/80">{selectedProduct.description}</span>
                </p>
                <Label className="text-base mb-1">Observações</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>

              {/* Extras */}
              <div className="space-y-2">
                <Label className="text-base">Extras (opcionais)</Label>
                {isExtrasLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
                    <span className="ml-2 text-sm text-gray-600">Carregando extras...</span>
                  </div>
                ) : extras && extras.length > 0 ? (
                  <div className="space-y-3 max-h-48 overflow-y-auto border rounded-md p-3 bg-gray-50 border-gray-200">
                    {extras.map((extra) => (
                      <div key={extra.id} className="flex items-center space-x-3">
                        <Checkbox
                          id={`extra-${extra.id}`}
                          checked={selectedExtras.includes(extra)}
                          onCheckedChange={(checked) => handleExtraChange(extra, checked === true)}
                          disabled={isLoading}
                          className="cursor-pointer"
                        />
                        <div className="flex-1">
                          <label
                            htmlFor={`extra-${extra.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {extra.name} <span className="text-xs text-gray-600">(Max. 1)</span>
                          </label>
                          <p className="text-xs text-green-600">
                            +{formatPriceWithCurrencyStyle(extra.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 py-2">Nenhum extra disponível</div>
                )}
                {selectedExtras.length > 0 && (
                  <p className="text-xs text-blue-600">
                    {selectedExtras.length} extra
                    {selectedExtras.length > 1 ? "s" : ""} selecionado
                    {selectedExtras.length > 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </>
          )}

          <p className="text-2xl font-bold text-primary pt-2">
            R${" "}
            {(
              (selectedProduct?.price || 0) +
              selectedExtras.reduce((acc, extra) => acc + extra.price, 0)
            )
              .toFixed(2)
              .replace(".", ",")}
          </p>

          <Button onClick={addToCart} className="w-full bg-primary hover:bg-primary/90 text-white ">
            Adicionar ao carrinho
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
