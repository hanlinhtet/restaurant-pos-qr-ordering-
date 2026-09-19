import prisma from "@/lib/prisma";

export async function getMenuData(tableId: string) {
  const table = await prisma.table.findUnique({
    where: { id: tableId },
    include: { branch: { include: { business: true } } }
  });

  if (!table) return null;

  const categories = await prisma.category.findMany({
    where: { businessId: table.branch.businessId },
    include: {
      products: {
        include: {
          recipeItems: true,
          variants: { include: { recipeItems: true } },
          attributes: { include: { recipeItems: true } }
        }
      }
    }
  });

  return {
    business: table.branch.business,
    table,
    categories
  };
}
