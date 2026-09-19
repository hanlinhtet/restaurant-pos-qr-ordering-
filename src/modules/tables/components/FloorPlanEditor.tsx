"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { updateTablePositionAction } from "../actions/tableActions";
import { toast } from "sonner";
import { User } from "lucide-react";

const GRID_SIZE = 96;

export function FloorPlanEditor({ tables }: { tables: any[] }) {
  const [tablePositions, setTablePositions] = useState(
    tables.map((t: any) => ({
      id: t.id,
      x: t.positionX,
      y: t.positionY,
    }))
  );

  const snapToGrid = (val: number) => Math.round(val / GRID_SIZE) * GRID_SIZE;

  const isColliding = (x: number, y: number, id: string) => {
    return tablePositions.some(p => {
        if (p.id === id) return false;
        return Math.abs(x - p.x) < GRID_SIZE && Math.abs(y - p.y) < GRID_SIZE;
    });
  };

  const handleDragEnd = async (_: any, info: any, id: string) => {
    const table = tablePositions.find(p => p.id === id);
    if (!table) return; // Safety check
    
    let finalX = snapToGrid(table.x + info.offset.x);
    let finalY = snapToGrid(table.y + info.offset.y);

    let attempts = 0;
    while (isColliding(finalX, finalY, id) && attempts < 100) {
        finalX += GRID_SIZE;
        attempts++;
    }

    setTablePositions((prev) =>
      prev.map((pos) => (pos.id === id ? { ...pos, x: finalX, y: finalY } : pos))
    );

    const result = await updateTablePositionAction(id, { x: finalX, y: finalY });
    if (!result.success) {
      toast.error("Failed to persist position");
    }
  };

  const handleAutoLayout = async () => {
    const newPositions = tables.map((table, index) => {
        const cols = 8;
        const x = (index % cols) * GRID_SIZE;
        const y = Math.floor(index / cols) * GRID_SIZE;
        return { id: table.id, x, y };
    });

    setTablePositions(newPositions);
    
    for (const pos of newPositions) {
        await updateTablePositionAction(pos.id, { x: pos.x, y: pos.y });
    }
    toast.success("Layout reset");
  };

  return (
    <div className="space-y-4">
        <Button onClick={handleAutoLayout}>Snap All to Grid</Button>
        <div 
            className="relative w-full h-[600px] border-4 border-dashed border-slate-300 rounded-3xl bg-slate-50 overflow-hidden p-4"
            style={{
                backgroundImage: `radial-gradient(circle, #cbd5e1 1px, transparent 1px)`,
                backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`
            }}
        >
        {tables.map((table) => {
            const position = tablePositions.find((pos) => pos.id === table.id);
            
            return (
            <motion.div
                key={table.id}
                drag
                dragMomentum={false}
                dragConstraints={{ left: 0, right: 640, top: 0, bottom: 520 }}
                animate={{ x: position?.x || 0, y: position?.y || 0 }}
                onDragEnd={(_, info) => handleDragEnd(null, info, table.id)}
                className="absolute cursor-grab active:cursor-grabbing p-1"
            >
                <Card className="w-20 h-20 flex flex-col items-center justify-center shadow-lg border-2 border-slate-200 rounded-2xl bg-white hover:bg-slate-50 transition-colors">
                    <CardContent className="p-1 text-center">
                        <div className="font-bold text-sm text-slate-800">{table.number}</div>
                        <div className="flex flex-wrap gap-0 justify-center mt-1">
                            {Array.from({ length: Math.min(table.capacity, 8) }).map((_, i) => (
                                <User key={i} className="w-4 h-4 text-slate-500" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
            );
        })}
        </div>
    </div>
  );
}
