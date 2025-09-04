import type { Product } from "@/types";
import MenuProductImage from "./menu-product-image";

export default function MenuProductCard({
  product,
  onCardClick,
  showSalesCount = false,
}: {
  product: Product;
  onCardClick: (product: Product) => void;
  showSalesCount?: boolean;
}) {
  return (
    <div
      key={product.id}
      className="flex items-center space-x-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors relative"
      onClick={() => onCardClick(product)}
    >
      {showSalesCount && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {product.salesCount}
        </span>
      )}

      <div className="flex-1">
        <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{product.description}</p>
        <p className="text-primary font-bold">
          R$ {product.price.toFixed(2).replace(".", ",")}
        </p>
      </div>
      <div className="size-28 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
        <MenuProductImage
          product={product}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
