"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Tags,
  Table as TableIcon,
  ClipboardList,
  CookingPot,
  CreditCard,
  Users,
  Settings,
  LogOut,
  LayoutGrid,
  BarChart3,
  Package,
  Boxes
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { UserRole } from "@prisma/client";

import { DASHBOARD_ROUTES } from "../../auth/utils/routes";
import { logout } from "@/modules/auth/actions/logout";

interface SidebarProps {
  businessName?: string | null;
  businessLogo?: string | null;
  userRole?: UserRole;
}

export function Sidebar({ businessName, businessLogo, userRole }: SidebarProps) {
  const pathname = usePathname();

  const filteredRoutes = DASHBOARD_ROUTES.filter(route => 
    !userRole || route.roles.includes(userRole)
  );

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-300 border-r border-white/5">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 overflow-hidden">
            {businessLogo ? (
              <Image src={businessLogo} alt="Logo" width={36} height={36} className="object-cover w-full h-full" />
            ) : (
              <LayoutGrid className="text-white w-5 h-5" />
            )}
          </div>
          <span className="text-xl font-bold text-white tracking-tight truncate max-w-[150px]">
            {businessName || "POS Admin"}
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {filteredRoutes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
              pathname === route.href 
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : "hover:bg-white/5 hover:text-white"
            )}
          >
            <route.icon className={cn(
              "w-5 h-5 transition-colors",
              pathname === route.href ? "text-white" : "text-slate-400 group-hover:text-white"
            )} />
            {route.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-white/5">
        <form action={logout}>
          <Button 
            type="submit"
            variant="ghost" 
            className="w-full justify-start gap-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl px-3"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </Button>
        </form>
      </div>
    </div>
  );
}
