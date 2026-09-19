import { protectPage } from "@/modules/auth/utils/rbac";
import { UserRole } from "@prisma/client";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import InventoryPageWrapper from "./page.wrapper";

export default async function InventoryPage() {
  const session = await protectPage([UserRole.OWNER, UserRole.MANAGER, UserRole.KITCHEN]);

  const businessUser = await prisma.businessUser.findFirst({
    where: { userId: session.user.id },
    include: { business: { include: { branches: true } } }
  });
  
  if (!businessUser) redirect("/onboarding");

  const branchId = businessUser.business.branches[0]?.id;
  
  if (!branchId) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold">No branches found</h2>
        <p className="text-muted-foreground">Please create a branch first in settings.</p>
      </div>
    );
  }

  return (
    <InventoryPageWrapper 
      businessId={businessUser.businessId} 
      branchId={branchId} 
    />
  );
}
