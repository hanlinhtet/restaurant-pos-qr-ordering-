import { protectPage } from "@/modules/auth/utils/rbac";
import { UserRole } from "@prisma/client";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getInventoryCategories } from "@/modules/inventory/actions/inventoryCategory";
import { InventoryCategoryManager } from "@/modules/inventory/components/InventoryCategoryManager";

export default async function InventoryCategoriesPage() {
  const session = await protectPage([UserRole.OWNER, UserRole.MANAGER, UserRole.KITCHEN]);

  const businessUser = await prisma.businessUser.findFirst({
    where: { userId: session.user.id },
    include: { business: true }
  });
  
  if (!businessUser) redirect("/onboarding");

  const categories = await getInventoryCategories(businessUser.businessId);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Inventory Categories</h2>
        <p className="text-muted-foreground mt-2 font-medium">
          Manage categories to organize your ingredients.
        </p>
      </div>
      
      <InventoryCategoryManager 
        categories={categories} 
        businessId={businessUser.businessId} 
      />
    </div>
  );
}
