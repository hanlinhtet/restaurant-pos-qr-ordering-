"use client";

import { Sidebar } from "@/modules/dashboard/components/Sidebar";
import { UserNav } from "@/modules/dashboard/components/UserNav";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { usePathname } from "next/navigation";

import { UserRole } from "@prisma/client";

export default function DashboardLayout({
  children,
  businessName,
  businessLogo,
  userName,
  userRole
}: {
  children: React.ReactNode;
  businessName?: string | null;
  businessLogo?: string | null;
  userName?: string | null;
  userRole?: UserRole;
}) {
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";

  return (
    <div className="h-full relative bg-slate-50/50">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80]">
        <Sidebar businessName={businessName} businessLogo={businessLogo} userRole={userRole} />
      </div>
      <main className="md:pl-72 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 glass border-b px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            {isDashboard && (
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search orders, products, customers..." 
                  className="pl-10 bg-white/50 border-white/40 focus:bg-white transition-all rounded-xl"
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <UserNav name={userName} role={userRole} />
          </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
