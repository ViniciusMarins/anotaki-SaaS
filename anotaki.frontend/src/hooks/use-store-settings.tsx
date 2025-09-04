// interface StoreStatusResponse {
//   isOpen: boolean;
//   message: string;
//   currentTime: string;
//   openingTime?: string;
//   closingTime?: string;
//   dayOfWeek: string;
// }

// export const useStoreStatus = () => {
//   return useQuery({
//     queryKey: ["storeStatus"],
//     queryFn: async (): Promise<StoreStatusResponse> => {
//       const response = await api.get("/store-settings/is-open");
//       return response.data;
//     },
//     staleTime: 30000,
//   });
// };

// export const useWorkingHours = () => {
//   return useQuery({
//     queryKey: ["workingHours"],
//     queryFn: async () => {
//       const response = await api.get("/store-settings/working-hours");
//       return response.data;
//     },
//     staleTime: 300000, // 5 minutos
//   });
// };
