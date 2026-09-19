import { Sidebar } from "@/modules/dashboard/components/Sidebar";
import { UserNav } from "@/modules/dashboard/components/UserNav";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import DashboardClientLayout from "./layout.base";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  let businessName = null;
  let businessLogo = null;
  
  if (session?.user?.id) {
    const businessUser = await prisma.businessUser.findFirst({
      where: { userId: session.user.id },
      include: { business: true }
    });
    businessName = businessUser?.business?.name;
    businessLogo = businessUser?.business?.logo;
  }

  return (
    <DashboardClientLayout 
      businessName={businessName} 
      businessLogo={businessLogo}
      userName={session?.user?.name}
      userRole={session?.user?.role}
    >
      {children}
    </DashboardClientLayout>
  );
}
