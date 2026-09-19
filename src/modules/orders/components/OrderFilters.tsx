"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Calendar as CalendarIcon, X, Filter } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "use-debounce";
import { Button } from "@/components/ui/button";

export function OrderFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [debouncedSearch] = useDebounce(search, 500);

  const currentPreset = searchParams.get("preset") || "today";
  const isCustom = currentPreset === "custom";

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch("");
    router.push(pathname);
  };

  useEffect(() => {
    if (debouncedSearch !== (searchParams.get("search") || "")) {
        updateFilters({ search: debouncedSearch });
    }
  }, [debouncedSearch]);

  return (
    <div className="space-y-4 mb-8 bg-white p-6 rounded-2xl border shadow-sm">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by Order ID or Table..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Order Type */}
          <Select
            defaultValue={searchParams.get("type") || "all"}
            onValueChange={(v) => updateFilters({ type: v })}
          >
            <SelectTrigger className="w-[140px] h-11 bg-slate-50 border-slate-200 rounded-xl">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="DINE_IN">Dine In</SelectItem>
              <SelectItem value="TAKEAWAY">Takeaway</SelectItem>
            </SelectContent>
          </Select>

          {/* Status */}
          <Select
            defaultValue={searchParams.get("status") || "all"}
            onValueChange={(v) => updateFilters({ status: v })}
          >
            <SelectTrigger className="w-[140px] h-11 bg-slate-50 border-slate-200 rounded-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PREPARING">Preparing</SelectItem>
              <SelectItem value="READY">Ready</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Presets */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-1 rounded-xl h-11">
            <Select
              defaultValue={currentPreset}
              onValueChange={(v) => {
                if (v === "custom") {
                  updateFilters({ preset: v });
                } else {
                  updateFilters({ preset: v, startDate: null, endDate: null });
                }
              }}
            >
              <SelectTrigger className="w-[150px] border-0 bg-transparent focus:ring-0 shadow-none h-9">
                <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="last7">Last 7 Days</SelectItem>
                <SelectItem value="last30">Last 30 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            variant="ghost" 
            onClick={clearFilters}
            className="h-11 px-4 text-slate-500 hover:text-slate-900 rounded-xl"
          >
            <X className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      {/* Custom Date Range Row - Animated/Visible only when custom selected */}
      {isCustom && (
        <div className="flex items-center gap-3 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">From</label>
            <Input
              type="date"
              className="w-[160px] h-10 bg-slate-50 border-slate-200 rounded-lg"
              defaultValue={searchParams.get("startDate") || ""}
              onChange={(e) => updateFilters({ startDate: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">To</label>
            <Input
              type="date"
              className="w-[160px] h-10 bg-slate-50 border-slate-200 rounded-lg"
              defaultValue={searchParams.get("endDate") || ""}
              onChange={(e) => updateFilters({ endDate: e.target.value })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
