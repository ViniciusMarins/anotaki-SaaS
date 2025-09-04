import type { DashboardRequestDto, DashboardResponseDto } from "@/types";
import { apiClient } from "../config";

export async function GetDashboardData(
  params: DashboardRequestDto
): Promise<DashboardResponseDto> {
  const response = await apiClient.post<DashboardResponseDto>(
    "/api/v1/dashboard",
    params
  );

  return response.data;
}
