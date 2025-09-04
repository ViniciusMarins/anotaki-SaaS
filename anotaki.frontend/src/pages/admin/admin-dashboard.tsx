import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Legend,
  Cell,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarRange,
  Circle,
  DollarSign,
  ShoppingBag,
  ShoppingBasket,
  User,
} from "lucide-react";
import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { GetDashboardData } from "@/api/_requests/dashboard";
import type { OrdersGraphItem } from "@/types";
import { daysMap, monthsMap } from "@/lib/utils";
import {
  CustomOrdersGraphTooltip,
  CustomProductsGraphTooltip,
} from "@/components/dashboard/custom-graph-tooltips";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const CARD_ICONS = [ShoppingBag, User, DollarSign, User];

const chartConfig = {
  totalOrders: {
    color: "var(--primary-300)",
  },
} satisfies ChartConfig;

const productsChartConfig = {} satisfies ChartConfig;

export default function AdminDashboard() {
  const [ordersGraphFilter, setOrdersGraphFilter] = useState<
    "week" | "month" | "year"
  >("week");

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", ordersGraphFilter],
    queryFn: () => GetDashboardData({ ordersGraphFilter }),
    placeholderData: keepPreviousData,
    staleTime: 0,
    gcTime: 0,
  });

  if (isLoading) {
    return (
      <main className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center">
            <Circle className="animate-spin mr-3 h-6 w-6 text-primary" />
            <span>Carregando dados...</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {data?.cardMetricItems.map((item, index) => {
            const Icon = CARD_ICONS[index];

            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    {item.name}
                  </CardTitle>
                  <div className="flex items-center p-2 bg-gray-100 rounded-md">
                    <Icon className="size-4 text-blue-600 shrink-0" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {item.name === "Receita Total"
                      ? item.value.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })
                      : item.value.toLocaleString("pt-BR")}
                  </div>
                  <p
                    className={`text-xs ${
                      !(item.notes ?? "").startsWith("-")
                        ? "text-green-600"
                        : "text-red-600"
                    } mt-1`}
                  >
                    {item.notes}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Products Chart */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-1">
                  <CardTitle>Vendas por Produto</CardTitle>
                  <CardDescription>
                    Quantidade de vendas do top 5 produtos
                  </CardDescription>
                </div>

                <div className="flex items-center p-2 bg-gray-100 rounded-md">
                  <ShoppingBasket className="size-4 text-blue-600 shrink-0" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ChartContainer
                config={productsChartConfig}
                className="mx-auto aspect-square max-h-[400px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<CustomProductsGraphTooltip />}
                  />
                  <Pie
                    data={data?.productsGraph}
                    dataKey="salesCount"
                    nameKey="name"
                  >
                    {data?.productsGraph.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Orders Chart with Date Filter */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-1">
                  <CardTitle>Pedidos por Período</CardTitle>
                  <CardDescription>
                    Quantidade de pedidos e receita
                  </CardDescription>
                </div>

                <div className="flex items-center p-2 bg-gray-100 rounded-md">
                  <CalendarRange className="size-4 text-blue-600 shrink-0" />
                </div>
              </div>

              <div className="flex flex-col mt-4">
                <div className="self-end">
                  <Select
                    value={ordersGraphFilter}
                    onValueChange={(value: string) =>
                      setOrdersGraphFilter(value as "week" | "month" | "year")
                    }
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Semana Atual</SelectItem>
                      <SelectItem value="month">Por mês</SelectItem>
                      <SelectItem value="year">Por ano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-0 w-full">
              <div className="w-full overflow-x-auto custom-scroll">
                <ChartContainer
                  config={chartConfig}
                  className="mx-auto pr-8 min-w-[400px] max-h-[400px]"
                >
                  <BarChart
                    accessibilityLayer
                    data={data?.ordersGraph}
                    maxBarSize={30}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey={(item: OrdersGraphItem) =>
                        ordersGraphFilter == "week"
                          ? daysMap[item.key as keyof typeof daysMap]
                          : ordersGraphFilter == "month"
                          ? monthsMap[item.key as keyof typeof monthsMap]
                          : item.key
                      }
                      tickFormatter={(value) =>
                        ordersGraphFilter !== "year" ? value.slice(0, 3) : value
                      }
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      allowDecimals={false}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<CustomOrdersGraphTooltip />}
                    />
                    <Bar
                      dataKey="totalOrders"
                      fill="var(--color-totalOrders)"
                      radius={8}
                    />
                  </BarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
