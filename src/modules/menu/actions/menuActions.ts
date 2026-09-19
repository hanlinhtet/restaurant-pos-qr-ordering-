"use server";

import prisma from "@/lib/prisma";

export async function getMenuDataAction(tableId: string) {
  const table = await prisma.table.findUnique({
    where: { id: tableId },
    include: { branch: { include: { business: true } } }
  });

  if (!table) return null;

  const rawCategories = await prisma.category.findMany({
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

  const categories = rawCategories.map(cat => ({
    ...cat,
    products: cat.products.filter(prod => 
        prod.recipeItems.length > 0 || 
        prod.variants.some(v => v.recipeItems.length > 0) ||
        prod.attributes.some(a => a.recipeItems.length > 0)
    )
  }));

  // Fetch product order counts
  const orderCounts = await prisma.orderItem.groupBy({
    by: ['productId'],
    _count: { productId: true },
    where: { order: { branch: { businessId: table.branch.businessId } } }
  });

  const countMap = new Map(orderCounts.map(item => [item.productId, item._count.productId]));

  // Create "Popular" category if there are products with > 5 orders
  const popularProducts = categories
    .flatMap(cat => cat.products)
    .filter(prod => (countMap.get(prod.id) || 0) > 5)
    .map(prod => ({
        ...prod,
        price: prod.price ? Number(prod.price) : null,
        orderCount: countMap.get(prod.id) || 0,
        variants: prod.variants.map(v => ({
            id: v.id,
            name: v.name,
            price: Number(v.price),
            portion: v.portion,
            flavour: v.flavour,
            productId: v.productId
        }))
    }));

  // Convert Decimals to numbers for serialization
  const serializedCategories = categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    businessId: cat.businessId,
    products: cat.products.map(prod => ({
        id: prod.id,
        name: prod.name,
        description: prod.description,
        price: prod.price ? Number(prod.price) : null,
        image: prod.image,
        categoryId: prod.categoryId,
        applyAttribute: prod.applyAttribute,
        applyPortion: prod.applyPortion,
        isAvailable: prod.isAvailable,
        orderCount: countMap.get(prod.id) || 0,
        variants: prod.variants.map(v => ({
            id: v.id,
            name: v.name,
            price: Number(v.price),
            portion: v.portion,
            flavour: v.flavour,
            productId: v.productId,
            isAvailable: v.isAvailable
        }))
    }))
  }));

  const allCategories = popularProducts.length > 0 
    ? [{ id: 'popular', name: 'Popular', businessId: table.branch.businessId, products: popularProducts }, ...serializedCategories]
    : serializedCategories;

  return {
    business: table.branch.business,
    table,
    categories: allCategories
  };
}
