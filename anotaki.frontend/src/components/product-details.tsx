import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Checkbox } from "./ui/checkbox";
import { Button } from "@/components/ui/button";
import { SecondaryText } from "./design/secondary-text";

interface ProductDetailsDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedProduct: any;
  addToCartFromDialog: (product: any) => void;
}

export function ProductDetailsDialog({
  open,
  setOpen,
  selectedProduct,
  addToCartFromDialog,
}: ProductDetailsDialogProps) {
  const [expandedExtras, setExpandedExtras] = useState<string | undefined>(
    "extras"
  );
  const [selectedExtras, setSelectedExtras] = useState<number[]>([]);

  useEffect(() => {
    setSelectedExtras([]);
  }, [selectedProduct?.id]);

  const handleExtraToggle = (extraId: number, checked: boolean) => {
    setSelectedExtras((prev) =>
      checked ? [...prev, extraId] : prev.filter((id) => id !== extraId)
    );
  };

  const calculateTotalPrice = () => {
    const basePrice = selectedProduct?.price || 0;
    const extrasPrice = selectedExtras.reduce((total, extraId) => {
      const extra = selectedProduct?.extras.find(
        (e: any) => e.extra.id === extraId
      );
      return total + (extra?.extra.price || 0);
    }, 0);
    return basePrice + extrasPrice;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="border-0">
        <DialogHeader>
          <DialogTitle>{selectedProduct?.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
            <img
              alt={selectedProduct?.name}
              className="w-full h-full object-cover"
            />
          </div>

          <SecondaryText className="text-base mb-2">
            <span className="font-bold text-base">Descrição:</span>{" "}
            {selectedProduct?.description}
          </SecondaryText>

          <div className="mb-10">
            {selectedProduct?.extras?.length > 0 && (
              <Accordion
                type="single"
                collapsible
                value={expandedExtras}
                onValueChange={setExpandedExtras}
                className="w-full"
              >
                <AccordionItem
                  value="extras"
                  className="bg-gray-100 rounded-lg"
                >
                  <AccordionTrigger className="px-4 py-3 hover:no-underline mb-2">
                    <span className="font-medium text-gray-900">
                      Deseja Adicionais?
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      Escolha até {selectedProduct?.extras.length} itens
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-3">
                      {selectedProduct.extras.map((extraItem: any) => {
                        const isChecked = selectedExtras.includes(
                          extraItem.extra.id
                        );

                        return (
                          <div
                            key={extraItem.extra.id}
                            onClick={() =>
                              handleExtraToggle(extraItem.extra.id, !isChecked)
                            }
                            className={`flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer ${isChecked ? "bg-gray-50" : ""
                              }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                  alt={extraItem.extra.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 text-sm">
                                  {extraItem.extra.name}
                                </h4>
                                <div className="flex items-center justify-between">
                                  <span className="text-primary font-bold text-sm">
                                    R${" "}
                                    {extraItem.extra.price
                                      .toFixed(2)
                                      .replace(".", ",")}
                                  </span>
                                  <span className="ml-2 text-xs text-gray-500">
                                    Máx 1.
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Checkbox
                              checked={isChecked}
                              className="border-[1px] border-primary"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </div>

          <Button
            onClick={() => {
              if (selectedProduct) {
                const productWithExtras = {
                  ...selectedProduct,
                  selectedExtras,
                  totalPrice: calculateTotalPrice(),
                };
                addToCartFromDialog(productWithExtras);
              }
            }}
            className="w-full bg-primary hover:bg-primary/90 text-white cursor-pointer flex items-center justify-between"
          >
            <span>Adicionar ao carrinho</span>
            <span className="font-semibold text-base">
              R$ {calculateTotalPrice().toFixed(2).replace(".", ",")}
            </span>
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
