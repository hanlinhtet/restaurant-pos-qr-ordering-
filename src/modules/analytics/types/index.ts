export interface AnalyticsData {
  revenueByMonth: { name: string; amount: number }[];
  revenueByDay: { date: string; amount: number }[];
  orderCountByDay: Record<string, number>;
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  unpaidOrders: number;
  topProducts: { name: string; count: number; revenue: number }[];
  salesByHour: { hour: number; count: number }[];
  paymentMethodPerformance: { method: string; count: number }[];
  staffList: { name: string; role: string; ordersHandled: number }[];
}
