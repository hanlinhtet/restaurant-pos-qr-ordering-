"use client";

import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, TrendingUp, CreditCard, ShoppingCart, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsGridWidgetProps {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  demandCount: number;
}

export function StatsGridWidget({ totalRevenue, totalOrders, avgOrderValue, demandCount }: StatsGridWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSmall, setIsSmall] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
        for (let entry of entries) {
            setIsSmall(entry.contentRect.height < 110);
        }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const stats = [
    { title: "Revenue", value: totalRevenue.toLocaleString(), unit: "MMK", icon: CreditCard, up: true, trend: "+12%" },
    { title: "Orders", value: totalOrders.toString(), unit: "Bills", icon: ShoppingCart, up: true, trend: "+8%" },
    { title: "Avg Value", value: Math.round(avgOrderValue).toLocaleString(), unit: "MMK", icon: TrendingUp, up: true, trend: "+5%" },
    { title: "Demand", value: demandCount.toString(), unit: "Pending", icon: Activity, up: demandCount < 10, trend: "Live" },
  ];

  return (
    <div ref={containerRef} className="grid grid-cols-2 grid-rows-2 gap-3 h-full w-full min-h-0">
      {stats.map((stat, i) => (
        <Card key={i} className={cn(
            "flex flex-col border-none shadow-none bg-slate-50 dark:bg-slate-800/50 rounded-2xl group hover:bg-slate-100 transition-all overflow-hidden p-3",
            isSmall ? "justify-center" : "justify-between"
        )}>
          {!isSmall && (
            <div className="flex items-center gap-1.5 min-h-0 shrink-0">
                <stat.icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary transition-colors shrink-0" />
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight truncate">{stat.title}</span>
            </div>
          )}

          <div className={cn(
              "flex items-baseline gap-1 min-h-0 overflow-hidden",
              isSmall ? "justify-center" : "flex-1 items-center"
          )}>
            <div className={cn(
                "font-black text-slate-900 dark:text-white truncate leading-none",
                isSmall ? "text-base" : "text-lg sm:text-xl"
            )}>
                {stat.value}
            </div>
            {isSmall && stat.unit && (
                <span className="text-[10px] font-bold text-slate-400 uppercase">{stat.unit}</span>
            )}
          </div>

          <div className={cn(
              "flex items-center gap-1 min-h-0 shrink-0",
              isSmall ? "justify-center mt-1" : "justify-start",
              stat.up ? "text-emerald-600" : "text-rose-600"
          )}>
            <div className="flex items-center text-xs font-black">
                {stat.up ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
                {stat.trend}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
