"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Palette, CheckCircle } from "lucide-react";

export function AppearanceSettings({ businessLogo }: { businessLogo?: string | null }) {
  const [primaryColor, setPrimaryColor] = useState<string>("#6366f1"); // Default Indigo

  const applyTheme = (hex: string) => {
    setPrimaryColor(hex);
    document.documentElement.style.setProperty('--primary', hex);
    toast.success("Theme updated successfully!");
  };

  return (
    <div className="p-8 bg-white border rounded-2xl shadow-sm space-y-8">
      <div>
        <h3 className="font-bold text-xl">Appearance</h3>
        <p className="text-muted-foreground mt-1">Customize your dashboard's brand color.</p>
      </div>

      <div className="p-6 border rounded-2xl bg-slate-50 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary"><Palette className="h-5 w-5" /></div>
          <h4 className="font-semibold">Brand Color Picker</h4>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-6">
          <input 
            type="color" 
            value={primaryColor}
            onChange={(e) => applyTheme(e.target.value)}
            className="h-24 w-24 rounded-2xl cursor-pointer border-4 border-white shadow-lg"
          />
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Selected Color:</p>
            <p className="text-2xl font-mono font-bold tracking-tight uppercase">{primaryColor}</p>
            <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
              <CheckCircle className="h-4 w-4" />
              <span>Theme applied instantly</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
