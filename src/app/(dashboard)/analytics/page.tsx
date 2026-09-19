"use client";

import { useEffect, useState } from "react";
import { getAnalyticsAction } from "@/modules/analytics/actions/analyticsActions";
import { AnalyticsDashboard } from "@/modules/analytics/components/dashboard/AnalyticsDashboard";
import { SalesHeatmap } from "@/modules/analytics/components/SalesHeatmap";
import { SalesByHourChart, PaymentMethodChart } from "@/modules/analytics/components/widgets/Charts";
import { RevenueChartWidget } from "@/modules/analytics/components/widgets/RevenueChartWidget";
import { StatsGridWidget } from "@/modules/analytics/components/widgets/StatsGridWidget";
import { RecentActivityWidget } from "@/modules/analytics/components/widgets/RecentActivityWidget";
import { AnalyticsData } from "@/modules/analytics/types";

const defaultLayoutConfig = {
  lg: [
    { i: "stats", x: 0, y: 0, w: 12, h: 2 },
    { i: "revenue", x: 0, y: 2, w: 8, h: 4 },
    { i: "activity", x: 8, y: 2, w: 4, h: 4 },
    { i: "hourly", x: 0, y: 6, w: 6, h: 4 },
    { i: "payments", x: 6, y: 6, w: 3, h: 4 },
    { i: "heatmap", x: 9, y: 6, w: 3, h: 4 },
  ],
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    async function fetchData() {
        const result = await getAnalyticsAction(60);
        setData(result);
    }
    fetchData();
  }, []);

  if (!data) return (
    <div className="w-full h-full p-6 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-slate-400 font-bold animate-pulse uppercase tracking-widest">Loading Analytics...</div>
    </div>
  );

  const widgets = {
    stats: (
        <StatsGridWidget 
            totalRevenue={data.totalRevenue} 
            totalOrders={data.totalOrders} 
            avgOrderValue={data.avgOrderValue} 
            demandCount={data.unpaidOrders} 
        />
    ),
    revenue: <RevenueChartWidget data={data.revenueByMonth} />,
    activity: <RecentActivityWidget staffList={data.staffList} />,
    hourly: (
      <div className="w-full h-full flex flex-col">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Sales by Hour</h3>
        <div className="flex-1 min-h-0 w-full"><SalesByHourChart data={data.salesByHour} /></div>
      </div>
    ),
    payments: (
      <div className="w-full h-full flex flex-col">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Popularity Rate</h3>
        <div className="flex-1 min-h-0 w-full">
            <PaymentMethodChart data={data.topProducts.map(p => ({ method: p.name, count: p.count }))} />
        </div>
      </div>
    ),
    heatmap: (
      <div className="w-full h-full flex flex-col">
        <SalesHeatmap revenueData={data.orderCountByDay} />
      </div>
    ),
  };

  return (
    <AnalyticsDashboard 
        defaultLayouts={defaultLayoutConfig}
        widgets={widgets}
    />
  );
}
