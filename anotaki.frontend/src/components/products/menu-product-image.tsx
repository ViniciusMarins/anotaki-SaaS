import type { Product } from "@/types";
import NoImage from "@/assets/img/item_no_image.png";
import type { DetailedHTMLProps, ImgHTMLAttributes } from "react";

export default function MenuProductImage({
  product,
  ...props
}: {
  product: Product;
} & DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>) {
  return (
    <img
      src={
        product.imageData
          ? `data:${product.imageMimeType};base64,${product.imageData}`
          : NoImage
      }
      alt="product-image"
      {...props}
    />
  );
}
