// import { Badge } from "@/components/ui/badge";
// import { useStoreStatus } from "@/hooks/use-store-settings";
// import { Clock } from "lucide-react";

// interface StoreStatusBadgeProps {
//   className?: string;
//   showDetails?: boolean;
// }

// export const StoreStatusBadge: React.FC<StoreStatusBadgeProps> = ({
//   className = "",
//   showDetails = false,
// }) => {
//   const { data: storeStatus, isLoading } = useStoreStatus();

//   if (isLoading) {
//     return (
//       <Badge variant="secondary" className={className}>
//         <Clock className="w-3 h-3 mr-1" />
//         Carregando...
//       </Badge>
//     );
//   }

//   if (!storeStatus) return null;

//   return (
//     <div className={`flex items-center gap-2 ${className}`}>
//       <Badge
//         variant={storeStatus.isOpen ? "default" : "secondary"}
//         className={storeStatus.isOpen ? "bg-green-500" : "bg-red-500"}
//       >
//         <Clock className="w-3 h-3 mr-1" />
//         {storeStatus.isOpen ? "Aberto" : "Fechado"}
//       </Badge>

//       {showDetails && (
//         <span className="text-sm text-gray-600">
//           {storeStatus.isOpen
//             ? `Fecha às ${storeStatus.closingTime}`
//             : storeStatus.message}
//         </span>
//       )}
//     </div>
//   );
// };
