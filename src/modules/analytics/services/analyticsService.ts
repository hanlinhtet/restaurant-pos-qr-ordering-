import prisma from "@/lib/prisma";
import { subDays, format, eachDayOfInterval, startOfDay, endOfDay, startOfYear, eachMonthOfInterval } from "date-fns";
import { AnalyticsData } from "../types";

export async function getAnalyticsData(businessId: string, days: number = 30): Promise<AnalyticsData> {
  const startDate = subDays(new Date(), days);
  const startOfRange = startOfDay(startDate);
  const endOfRange = endOfDay(new Date());
  const startOfThisYear = startOfYear(new Date());
  
  // 1. Fetch data from DB
  const [payments, orders, bestProducts, hourlyStats, paymentStats, yearlyPayments, staffMembers] = await Promise.all([
    // Revenue data (daily)
    prisma.payment.findMany({
      where: { order: { branch: { businessId } }, createdAt: { gte: startOfRange } },
      select: { amount: true, createdAt: true }
    }),
    // General order stats
    prisma.order.findMany({
      where: { branch: { businessId }, createdAt: { gte: startOfRange } },
      select: { status: true, totalAmount: true, createdAt: true }
    }),
    // Top products
    prisma.orderItem.groupBy({
      by: ['productId'],
      _count: { productId: true },
      _sum: { subtotal: true },
      where: { order: { branch: { businessId }, createdAt: { gte: startOfRange } } },
      orderBy: { _count: { productId: 'desc' } },
      take: 5
    }),
    // Hourly trends
    prisma.order.findMany({
        where: { branch: { businessId }, createdAt: { gte: startOfRange } },
        select: { createdAt: true }
    }),
    // Payment breakdown
    prisma.payment.groupBy({
        by: ['method'],
        _count: { id: true },
        where: { order: { branch: { businessId } }, createdAt: { gte: startOfRange } }
    }),
    // Yearly revenue breakdown
    prisma.payment.findMany({
        where: { order: { branch: { businessId } }, createdAt: { gte: startOfThisYear } },
        select: { amount: true, createdAt: true }
    }),
    // Staff members
    prisma.businessUser.findMany({
        where: { businessId },
        include: { user: true }
    })
  ]);

  // 2. Process Daily Metrics
  const allDays = eachDayOfInterval({ start: startOfRange, end: endOfRange });
  const dailyRevenueMap: Record<string, number> = {};
  const dailyOrderCountMap: Record<string, number> = {};
  
  allDays.forEach(day => {
    const key = format(day, "yyyy-MM-dd");
    dailyRevenueMap[key] = 0;
    dailyOrderCountMap[key] = 0;
  });

  payments.forEach(p => {
    const key = format(p.createdAt, "yyyy-MM-dd");
    if (dailyRevenueMap[key] !== undefined) dailyRevenueMap[key] += Number(p.amount);
  });

  orders.forEach(o => {
    const key = format(o.createdAt, "yyyy-MM-dd");
    if (dailyOrderCountMap[key] !== undefined) dailyOrderCountMap[key] += 1;
  });

  // 3. Process Yearly Metrics (All 12 months)
  const allMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyRevenueMap: Record<string, number> = {};
  allMonths.forEach(m => {
      monthlyRevenueMap[m] = 0;
  });

  yearlyPayments.forEach(p => {
      const key = format(p.createdAt, "MMM");
      if (monthlyRevenueMap[key] !== undefined) monthlyRevenueMap[key] += Number(p.amount);
  });

  const revenueByMonth = allMonths.map(name => ({ name, amount: monthlyRevenueMap[name] }));

  // 3. Process KPI Stats
  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const paidOrderIds = new Set(payments.map(p => p.orderId));
  const totalOrders = orders.filter(o => o.status === 'COMPLETED' || paidOrderIds.has(o.id)).length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const unpaidOrders = orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length;

  // 5. Process Top Products
  const topProducts = await Promise.all(
    bestProducts.map(async (p) => {
        const product = await prisma.product.findUnique({ where: { id: p.productId } });
        return { 
            name: product?.name || "Unknown", 
            count: p._count.productId,
            revenue: Number(p._sum.subtotal || 0)
        };
    })
  );

  // 6. Process Hourly Trends
  const hourlyMap = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
  hourlyStats.forEach(o => {
      const hour = o.createdAt.getHours();
      hourlyMap[hour].count++;
  });

  // 7. Staff List
  const staffList = staffMembers.map(bm => ({
      name: bm.user.name || "Unknown",
      role: bm.user.role,
      ordersHandled: 0 // Placeholder as orders are not linked to staff in current schema
  }));

  return {
    revenueByMonth,
    revenueByDay: Object.entries(dailyRevenueMap).map(([date, amount]) => ({ date, amount })),
    orderCountByDay: dailyOrderCountMap,
    totalRevenue,
    totalOrders,
    avgOrderValue,
    unpaidOrders,
    topProducts,
    salesByHour: hourlyMap,
    paymentMethodPerformance: paymentStats.map(p => ({ method: p.method, count: p._count.id })),
    staffList
  };
}
