import { UserRole } from "@prisma/client";
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
  BarChart3,
  Package,
  Boxes
} from "lucide-react";

export const DASHBOARD_ROUTES = [
  { 
    label: "Dashboard", 
    icon: LayoutDashboard, 
    href: "/dashboard",
    roles: [UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF] 
  },
  { 
    label: "Analytics", 
    icon: BarChart3, 
    href: "/analytics",
    roles: [UserRole.OWNER, UserRole.MANAGER] 
  },
  { 
    label: "Orders", 
    icon: ClipboardList, 
    href: "/orders",
    roles: [UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF] 
  },
  { 
    label: "Kitchen", 
    icon: CookingPot, 
    href: "/kitchen",
    roles: [UserRole.OWNER, UserRole.MANAGER, UserRole.KITCHEN] 
  },
  { 
    label: "Inventory", 
    icon: Package, 
    href: "/inventory",
    roles: [UserRole.OWNER, UserRole.MANAGER, UserRole.KITCHEN] 
  },
  { 
    label: "Inv. Categories", 
    icon: Boxes, 
    href: "/inventory-categories",
    roles: [UserRole.OWNER, UserRole.MANAGER, UserRole.KITCHEN] 
  },
  { 
    label: "Products", 
    icon: UtensilsCrossed, 
    href: "/products",
    roles: [UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF, UserRole.KITCHEN] 
  },
  { 
    label: "Categories", 
    icon: Tags, 
    href: "/categories",
    roles: [UserRole.OWNER, UserRole.MANAGER, UserRole.KITCHEN] 
  },
  { 
    label: "Tables", 
    icon: TableIcon, 
    href: "/tables",
    roles: [UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF] 
  },
  { 
    label: "Payments", 
    icon: CreditCard, 
    href: "/payments",
    roles: [UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF] 
  },
  { 
    label: "Staff", 
    icon: Users, 
    href: "/staff",
    roles: [UserRole.OWNER] 
  },
  { 
    label: "Settings", 
    icon: Settings, 
    href: "/settings",
    roles: [UserRole.OWNER, UserRole.MANAGER] 
  },
];

export function getFirstAvailableRoute(role: UserRole) {
  return DASHBOARD_ROUTES.find(route => route.roles.includes(role))?.href || "/dashboard";
}
