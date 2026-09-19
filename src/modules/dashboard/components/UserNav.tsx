"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { UserRole } from "@prisma/client";

interface UserNavProps {
  name?: string | null;
  role?: UserRole;
}

export function UserNav({ name, role }: UserNavProps) {
  const initials = name 
    ? name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
    : "AU";

  const roleLabel = role ? role.charAt(0) + role.slice(1).toLowerCase() : "User";

  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary rounded-full">
        <Bell className="h-5 w-5" />
        <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-white" />
      </Button>
      
      <div className="flex items-center gap-3 pl-4 border-l">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold leading-none">{name || "Admin User"}</p>
          <p className="text-[10px] font-black uppercase text-slate-400 mt-1 tracking-widest">{roleLabel}</p>
        </div>
        <Link href="/settings">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors shadow-sm">
            {initials}
          </div>
        </Link>
      </div>
    </div>
  );
}
