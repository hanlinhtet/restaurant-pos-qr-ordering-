"use client";

import React, { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ActivityMapProps {
  revenueData: Record<string, number>;
}

export function SalesHeatmap({ revenueData }: ActivityMapProps) {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  const years = [2024, 2025, 2026];

  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  }, [selectedYear, selectedMonth]);

  const monthData = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return {
        day,
        activity: revenueData[dateKey] || 0,
      };
    });
  }, [selectedYear, selectedMonth, daysInMonth, revenueData]);

  const maxActivity = useMemo(() => Math.max(...monthData.map(d => d.activity), 1), [monthData]);

  const getColorClass = (activity: number, max: number) => {
    if (activity === 0) return "bg-slate-100 dark:bg-slate-800/40 hover:bg-slate-200";
    const p = activity / max;
    if (p <= 0.25) return "bg-violet-200 dark:bg-violet-900/40 hover:bg-violet-300";
    if (p <= 0.5) return "bg-violet-400 dark:bg-violet-700/60 hover:bg-violet-500";
    if (p <= 0.75) return "bg-violet-600 dark:bg-violet-500/80 hover:bg-violet-700";
    return "bg-violet-800 dark:bg-violet-400 hover:bg-violet-900"; 
  };

  return (
    // Ensure parent is flex-col and has min-h-0 to contain the grid
    <div className="w-full h-full flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
      
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tighter">Activity Map</h2>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{months[selectedMonth]} {selectedYear}</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={String(selectedYear)} onValueChange={(val) => setSelectedYear(parseInt(val))}>
            <SelectTrigger className="w-[80px] h-8 text-[11px] rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}
            </SelectContent>
          </Select>
          
          <Select value={String(selectedMonth)} onValueChange={(val) => setSelectedMonth(parseInt(val))}>
            <SelectTrigger className="w-[100px] h-8 text-[11px] rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month, index) => <SelectItem key={month} value={String(index)}>{month}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* THE FIX: 
        1. 'grid-rows-6' forces exactly 6 rows, preventing overflow.
        2. 'min-h-0' is critical on the grid itself to allow it to shrink inside the flex container.
      */}
      <div className="flex-1 w-full min-h-0 grid grid-cols-7 grid-rows-6 gap-1.5">
        {monthData.map((item) => {
          const p = item.activity / maxActivity;
          const colorClass = getColorClass(item.activity, maxActivity);
          const isHigh = p > 0.6;
          const isHovered = hoveredDay === item.day;
          
          return (
            <div
              key={item.day}
              onMouseEnter={() => setHoveredDay(item.day)}
              onMouseLeave={() => setHoveredDay(null)}
              className={cn(
                "relative flex items-center justify-center rounded-lg transition-all duration-300 hover:scale-105 cursor-pointer border border-black/5 dark:border-white/5 overflow-hidden w-full h-full",
                colorClass
              )}
            >
              <span className={cn(
                "text-[10px] sm:text-xs font-black tracking-tighter transition-opacity duration-200",
                isHovered ? "opacity-0" : "opacity-100",
                isHigh ? "text-white" : "text-slate-500 dark:text-slate-400"
              )}>
                {item.day}
              </span>
              
              <div className={cn(
                "absolute inset-0 flex items-center justify-center transition-opacity duration-200 bg-slate-900/95 text-white flex-col p-1 text-center z-10 pointer-events-none",
                isHovered ? "opacity-100" : "opacity-0"
              )}>
                <span className="text-[10px] font-bold leading-none">
                    {item.activity.toLocaleString()}
                </span>
                <span className="text-[7px] font-black uppercase mt-1 opacity-70 tracking-widest">Orders</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}