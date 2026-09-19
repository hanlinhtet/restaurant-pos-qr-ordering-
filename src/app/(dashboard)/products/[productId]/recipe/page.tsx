import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getInventoryItems } from "@/modules/inventory/services/inventory.service";
import { RecipeManager } from "@/modules/inventory/components/RecipeManager";
import { serialize } from "@/lib/utils";

export default async function ProductRecipePage({ params }: { params: { productId: string } }) {
  const { productId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const businessUser = await prisma.businessUser.findFirst({
    where: { userId: session.user.id },
    include: { business: { include: { branches: true } } }
  });
  
  if (!businessUser) redirect("/onboarding");

  const product = await prisma.product.findUnique({
    where: { 
      id: productId,
      businessId: businessUser.businessId 
    },
    include: {
      variants: true,
      recipeItems: {
        include: {
          inventoryItem: true,
          variant: true
        }
      }
    }
  });

  if (!product) redirect("/products");

  // Get inventory items for the first branch for now
  const branchId = businessUser.business.branches[0]?.id;
  const inventoryItems = await getInventoryItems(branchId);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <RecipeManager 
        product={serialize(product)} 
        inventoryItems={serialize(inventoryItems)} 
        existingRecipes={serialize(product.recipeItems)} 
      />
    </div>
  );
}
