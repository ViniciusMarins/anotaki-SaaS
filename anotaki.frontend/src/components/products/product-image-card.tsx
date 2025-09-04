import type { Product } from "@/types";

export default function ProductImageCard({
  product,
  onClick,
}: {
  product: Product;
  onClick?: () => void;
}) {
  return product.imageMimeType || product.imageData ? (
    <img
      onClick={onClick}
      src={`data:${product.imageMimeType};base64,${product.imageData}`}
      alt={product.name}
      className="w-16 h-16 object-cover rounded cursor-pointer"
    />
  ) : (
    <div className="size-16 bg-gray-200 rounded flex items-center justify-center">
      <span className="text-gray-400 text-[10px]">Sem img</span>
    </div>
  );
}
