"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { User, Store, Palette } from "lucide-react";
import { AccountSettingsForm } from "./AccountSettingsForm";
import { AppearanceSettings } from "./AppearanceSettings";

export function SettingsTabs({ user, business, branch }: any) {
  const [activeTab, setActiveTab] = useState("account");

  const tabs = [
    { id: "account", label: "Account", icon: User },
    { id: "business", label: "Business", icon: Store },
    { id: "appearance", label: "Appearance", icon: Palette },
  ];

  return (
    <div className="grid md:grid-cols-[240px,1fr] gap-8">
      {/* Tab Navigation */}
      <nav className="space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all",
              activeTab === tab.id 
                ? "bg-primary text-white shadow-md shadow-primary/20" 
                : "text-muted-foreground hover:bg-slate-100"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {activeTab === "account" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Account Settings</h2>
            <AccountSettingsForm user={user} business={business} branch={branch} activeTab="account" />
          </div>
        )}
        {activeTab === "business" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Business Profile</h2>
            <AccountSettingsForm user={user} business={business} branch={branch} activeTab="business" />
          </div>
        )}
        {activeTab === "appearance" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Appearance</h2>
            <AppearanceSettings businessLogo={business?.logo} />
          </div>
        )}
      </div>
    </div>
  );
}
