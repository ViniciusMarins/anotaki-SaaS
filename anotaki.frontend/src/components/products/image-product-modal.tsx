import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageData?: string;
  imageMimeType?: string;
}

export default function ImageProductModal({
  isOpen,
  onClose,
  imageData,
  imageMimeType,
}: ProductModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] sm:max-h-[425px] overflow-auto">
        {imageMimeType || imageData ? (
          <img
            src={`data:${imageMimeType};base64,${imageData}`}
            alt={"product-image"}
            className="w-full object-cover rounded"
          />
        ) : (
          <div className="bg-gray-200 rounded flex items-center justify-center w-full">
            <span className="text-gray-400"> Sem imagem </span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
