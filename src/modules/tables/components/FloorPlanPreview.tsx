"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { User, Clock } from "lucide-react";

const BOX_SIZE = 112; // w-28 = 112px
const GAP = 10;
const DB_GRID_SIZE = 96;
const SCALE = (BOX_SIZE + GAP) / DB_GRID_SIZE; // 1.27x

export function FloorPlanPreview({ tables }: { tables: any[] }) {
  // Calculate the actual bounds of the layout to avoid unnecessary scrolling
  const maxX = tables.length > 0 ? Math.max(...tables.map(t => t.positionX)) : 0;
  const maxY = tables.length > 0 ? Math.max(...tables.map(t => t.positionY)) : 0;

  const contentWidth = (maxX * SCALE) + BOX_SIZE + 64; // + padding
  const contentHeight = (maxY * SCALE) + BOX_SIZE + 64;

  return (
    <div className="w-full bg-slate-50/50 rounded-3xl p-1 border shadow-inner overflow-auto max-h-[600px] min-h-[400px]">
      <div 
        className="relative"
        style={{
            width: `${contentWidth}px`,
            height: `${contentHeight}px`,
            backgroundImage: `radial-gradient(circle, #cbd5e1 1px, transparent 1px)`,
            backgroundSize: `${DB_GRID_SIZE * SCALE}px ${DB_GRID_SIZE * SCALE}px`
        }}
      >
        {tables.map((table) => {
          const activeSession = table.sessions[0];
          const hasOrders = activeSession && Array.isArray(activeSession.orders) && activeSession.orders.length > 0;
          const latestOrder = hasOrders ? activeSession.orders[0] : null;
          
          let status = "idle";
          let colorClasses = "bg-emerald-50 text-emerald-600 border-emerald-100";
          let label = "Available";

          if (activeSession?.active) {
              if (!hasOrders) {
                  status = "checking";
                  colorClasses = "bg-yellow-50 text-yellow-700 border-yellow-200";
                  label = "Check Menu";
              } else if (latestOrder.status === "PENDING" || latestOrder.status === "PREPARING") {
                  status = "ordering";
                  colorClasses = "bg-orange-50 text-orange-700 border-orange-200";
                  label = "Ordering";
              } else if (latestOrder.status === "READY") {
                  status = "ready";
                  colorClasses = "bg-blue-50 text-blue-700 border-blue-200";
                  label = "Ready";
              } else if (latestOrder.status === "SERVED") {
                  status = "served";
                  colorClasses = "bg-indigo-50 text-indigo-700 border-indigo-200";
                  label = "Dining";
              }
          }

          const lastActive = activeSession?.lastActivity ? new Date(activeSession.lastActivity) : null;
          const isRecentlyActive = lastActive && (new Date().getTime() - lastActive.getTime() < 60000);

          return (
          <div
              key={table.id}
              className="absolute transition-all duration-500"
              style={{ 
                  left: (table.positionX * SCALE) + 32, // + padding
                  top: (table.positionY * SCALE) + 32 
              }}
          >
              <Card className={`relative w-28 h-28 flex flex-col items-center justify-center shadow-lg border-2 rounded-[1.5rem] bg-white overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl z-10 ${activeSession?.active ? "border-slate-100" : "border-dashed border-slate-300 bg-slate-50/50"}`}>

                  {/* Status Header Badge */}
                  <div className={`absolute top-0 left-0 right-0 py-1 text-[8px] font-black text-center uppercase tracking-tighter border-b ${colorClasses}`}>
                      {label}
                  </div>

                  {isRecentlyActive && (
                      <motion.div
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="absolute top-7 right-3 w-2 h-2 rounded-full bg-blue-400"
                      />
                  )}

                  <CardContent className="p-1 text-center relative z-10 flex flex-col items-center gap-1 pt-6 pb-2">
                      <div className="font-black text-lg text-slate-800">{table.number}</div>

                      <div className="flex -space-x-1 opacity-60">
                          {Array.from({ length: Math.min(table.capacity, 4) }).map((_, i) => (
                              <User key={i} className="w-3.5 h-3.5 text-slate-400" />
                          ))}
                      </div>

                      {lastActive && activeSession.active ? (
                          <div className="flex items-center gap-1 text-[8px] text-slate-400 mt-0.5">
                              <Clock className="w-2 h-2" />
                              {lastActive.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                      ) : (
                          <div className="h-3" />
                      )}
                  </CardContent>
                </Card>
              </div>
            )

        })}
      </div>
    </div>
  );
}
