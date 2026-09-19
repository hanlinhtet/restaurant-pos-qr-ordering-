"use client";

import React, { useState, useEffect, useRef } from "react";
import { Responsive } from "react-grid-layout";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

interface AnalyticsDashboardProps {
  widgets: Record<string, React.ReactNode>;
  defaultLayouts?: any;
  onLayoutSave?: (layouts: any) => void;
}

const STORAGE_KEY = "beestock-layout-v15";

// Helper function to force-inject 4-corner handles directly into layout item configurations
const hydrateLayoutHandles = (allLayouts: any) => {
  if (!allLayouts || typeof allLayouts !== "object") return {};
  const deepCopy = JSON.parse(JSON.stringify(allLayouts));
  Object.keys(deepCopy).forEach((breakpoint) => {
    if (Array.isArray(deepCopy[breakpoint])) {
      deepCopy[breakpoint] = deepCopy[breakpoint].map((item: any) => ({
        ...item,
        resizeHandles: ["se", "sw", "ne", "nw"],
      }));
    }
  });
  return deepCopy;
};

export function AnalyticsDashboard({ widgets, defaultLayouts, onLayoutSave }: AnalyticsDashboardProps) {
  const [mounted, setMounted] = useState(false);
  const [layouts, setLayouts] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    setMounted(true);

    const savedLayout = localStorage.getItem(STORAGE_KEY);
    if (savedLayout) {
      try {
        setLayouts(hydrateLayoutHandles(JSON.parse(savedLayout)));
      } catch (e) {
        if (defaultLayouts) setLayouts(hydrateLayoutHandles(defaultLayouts));
      }
    } else if (defaultLayouts) {
      setLayouts(hydrateLayoutHandles(defaultLayouts));
    }

    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const width = entries[0].contentRect.width;
      if (width > 0) {
        setContainerWidth(width);
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [defaultLayouts]);

  const onLayoutChange = (currentLayout: any, allLayouts: any) => {
    if (!mounted || !isEditing || containerWidth === 0) return;

    const fullyHydratedLayouts = hydrateLayoutHandles(allLayouts);
    setLayouts(fullyHydratedLayouts);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fullyHydratedLayouts));
    if (onLayoutSave) onLayoutSave(fullyHydratedLayouts);
  };

  const handleClearCache = () => {
    localStorage.removeItem(STORAGE_KEY);
    if (defaultLayouts) {
      setLayouts(hydrateLayoutHandles(defaultLayouts));
    } else {
      setLayouts({});
    }
    window.location.reload();
  };

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950">
      <style jsx global>{`
        /* 1. Transparent Interactive Hitbox Zone */
        .react-resizable-handle {
          opacity: ${isEditing ? '1' : '0'};
          pointer-events: ${isEditing ? 'auto' : 'none'};
          transition: opacity 0.2s ease;
          position: absolute;
          width: 28px !important;
          height: 28px !important;
          background: transparent !important;
          background-image: none !important;
          border: none !important;
          transform: none !important; /* THE FIX: Prevents the library from rotating the container */
          z-index: 50;
        }

        /* 2. Unified Bracket Blueprint Configurator */
        .react-resizable-handle::before {
          content: '';
          position: absolute;
          width: 10px;
          height: 10px;
          border: 0 solid transparent;       /* Reset all inherited borders */
          border-radius: 0px !important;
          box-sizing: border-box !important;
          transform: none !important;        /* THE FIX: Prevents the library from rotating the accent */
          transition: border-color 0.2s ease;
        }
        
        .react-resizable-handle:hover::before {
          border-color: #c084fc !important;
        }

        /* Top Left Corner Anchor: ┌ */
        .react-resizable-handle-nw {
          top: 0 !important;
          left: 0 !important;
          cursor: nw-resize !important;
        }
        .react-resizable-handle-nw::before {
          top: 10px;
          left: 10px;
          border-top: 2px solid #a855f7;
          border-left: 2px solid #a855f7;
        }

        /* Top Right Corner Anchor: ┐ */
        .react-resizable-handle-ne {
          top: 0 !important;
          right: 0 !important;
          cursor: ne-resize !important;
        }
        .react-resizable-handle-ne::before {
          top: 10px;
          right: 10px;
          border-top: 2px solid #a855f7;
          border-right: 2px solid #a855f7;
        }

        /* Bottom Left Corner Anchor: └ */
        .react-resizable-handle-sw {
          bottom: 0 !important;
          left: 0 !important;
          cursor: sw-resize !important;
        }
        .react-resizable-handle-sw::before {
          bottom: 10px;
          left: 10px;
          border-bottom: 2px solid #a855f7;
          border-left: 2px solid #a855f7;
        }

        /* Bottom Right Corner Anchor: ┘ */
        .react-resizable-handle-se {
          bottom: 0 !important;
          right: 0 !important;
          cursor: se-resize !important;
        }
        .react-resizable-handle-se::before {
          bottom: 10px;
          right: 10px;
          border-bottom: 2px solid #a855f7;
          border-right: 2px solid #a855f7;
        }

        /* Dashed Drop Placeholder */
        .react-grid-placeholder {
          background: rgba(168, 85, 247, 0.04) !important;
          border: 2px dashed #c084fc !important;
          border-radius: 1rem !important;
        }

        /* 3. Kill the Default Library "Ghost" Icons */
        .react-resizable-handle::after {
          content: none !important;
          display: none !important;
          background-image: none !important;
        }
        
        /* Just in case the library version injects an actual SVG */
        .react-resizable-handle svg {
          display: none !important;
        }
      `}</style>
      
      {/* Control Dashboard Header Option Panel with specific horizontal margins */}
      <div className="flex items-center justify-between p-6 mb-8 m-4 md:mx-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Business Analytics</h1>
          <p className="text-xs text-slate-400 font-medium mt-1">Grab the top center handle to move cards • Stretch from any of the 4 geometric corner anchors</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleClearCache}
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
          >
            Reset Layout
          </button>
          <button 
            onClick={() => setIsEditing(!isEditing)} 
            className={`px-5 py-2 text-xs font-black uppercase tracking-wider rounded-xl shadow transition-colors ${isEditing ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-purple-600 text-white hover:bg-purple-700"}`}
          >
            {isEditing ? "✓ Save Changes" : "Edit Dashboard"}
          </button>
        </div>
      </div>

      {/* Grid Canvas Wrapper Viewport */}
      <div ref={containerRef} className={`w-full min-h-[600px] transition-all duration-300 ${isEditing ? "p-2 bg-purple-50/20 rounded-3xl border-2 border-dashed border-purple-200/40" : ""}`}>
        {mounted && containerWidth > 0 && (
          <Responsive
            layouts={layouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768 }}
            cols={{ lg: 12, md: 10, sm: 6 }}
            width={containerWidth}
            rowHeight={110}
            onLayoutChange={onLayoutChange}
            isDraggable={isEditing}
            isResizable={isEditing}
            compactType="vertical"
            preventCollision={false}
            draggableHandle=".drag-handle"
            margin={[18, 18]}
          >
            {Object.entries(widgets).map(([key, widget]) => (
              <div key={key} className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col group">
                
                {/* Central Position Drag Grip */}
                {isEditing && (
                  <div className="drag-handle absolute top-2 left-1/2 -translate-x-1/2 px-3 py-0.5 cursor-grab active:cursor-grabbing bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 hover:text-purple-600 rounded-full z-40 transition-all flex items-center gap-1 shadow-sm">
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 8h16M4 16h16" />
                    </svg>
                    <span className="text-[8px] font-bold tracking-wider uppercase">Move</span>
                  </div>
                )}
                
                {/* Internal Card Components Area */}
                <div className="w-full h-full p-5 flex flex-col flex-1 min-h-0 pt-8">
                  {widget}
                </div>
              </div>
            ))}
          </Responsive>
        )}
      </div>
    </div>
  );
}