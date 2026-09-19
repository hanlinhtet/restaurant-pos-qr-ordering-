"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { 
  InventoryItemInput, 
  InventoryTransactionInput,
  RecipeItemInput 
} from "../validations/inventory";
import { serialize } from "@/lib/utils";

export async function createInventoryItem(businessId: string, data: InventoryItemInput & { conversions?: any[] }) {
  const item = await prisma.inventoryItem.create({
    data: {
      ...data,
      sku: data.sku || null,
      image: data.image || null,
      inventoryCategoryId: data.inventoryCategoryId || null,
      businessId,
      conversions: {
        create: data.conversions || []
      }
    },
  });
  revalidatePath("/inventory");
  return serialize(item);
}

export async function updateInventoryItem(itemId: string, data: InventoryItemInput & { conversions?: any[] }) {
  // 1. Update the item itself
  const item = await prisma.inventoryItem.update({
    where: { id: itemId },
    data: {
      name: data.name,
      sku: data.sku || null,
      image: data.image || null,
      unit: data.unit,
      minStockLevel: data.minStockLevel,
      costPerUnit: data.costPerUnit,
      inventoryCategoryId: data.inventoryCategoryId || null,
    },
  });

  // 2. Handle conversions: delete existing and recreate
  await prisma.unitConversion.deleteMany({
    where: { inventoryItemId: itemId }
  });
  
  if (data.conversions && data.conversions.length > 0) {
    await prisma.unitConversion.createMany({
      data: data.conversions.map(c => ({
        inventoryItemId: itemId,
        unit: c.unit,
        factor: c.factor
      }))
    });
  }

  revalidatePath("/inventory");
  return serialize(item);
}

export async function deleteInventoryItem(itemId: string) {
  // Note: Check if the item is used in recipes before deleting
  const usage = await prisma.recipeItem.findFirst({
    where: { inventoryItemId: itemId }
  });

  if (usage) {
    throw new Error("Cannot delete item: it is used in one or more recipes.");
  }

  await prisma.inventoryItem.delete({
    where: { id: itemId }
  });

  revalidatePath("/inventory");
  return { success: true };
}

export async function createUnitConversion(data: { inventoryItemId: string, unit: UnitOfMeasure, factor: number }) {
  const conversion = await prisma.unitConversion.create({
    data: {
      inventoryItemId: data.inventoryItemId,
      unit: data.unit,
      factor: data.factor,
    },
  });
  revalidatePath("/inventory");
  revalidatePath("/products");
  return serialize(conversion);
}

export async function addInventoryTransaction(data: InventoryTransactionInput) {
  const { inventoryItemId, type, quantity, reason } = data;

  const result = await prisma.$transaction(async (tx) => {
    const transaction = await tx.inventoryTransaction.create({
      data: {
        inventoryItemId,
        type,
        quantity,
        reason,
      },
    });

    const updatedItem = await tx.inventoryItem.update({
      where: { id: inventoryItemId },
      data: {
        stockAmount: {
          increment: quantity,
        },
      },
    });

    await updateAffectedProductsAvailability(tx, inventoryItemId);

    return { transaction, updatedItem };
  });

  return serialize(result);
}

export async function deductStockFromOrder(orderId: string) {
  // Check if already deducted to prevent double-counting
  const existingTransaction = await prisma.inventoryTransaction.findFirst({
    where: { orderId: orderId, type: "SALE" }
  });

  if (existingTransaction) {
    console.log(`Stock for order ${orderId} already deducted.`);
    return;
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: { include: { recipeItems: true } },
          variant: { include: { recipeItems: true } },
          attribute: { include: { recipeItems: true } },
        },
      },
    },
  });

  if (!order) return;

  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      // Filter product recipe items to only include "Base" ingredients (where variantId and attributeId are null)
      const baseRecipes = (item.product?.recipeItems || []).filter(r => !r.variantId && !r.attributeId);
      
      const recipes = [
        ...baseRecipes,
        ...(item.variant?.recipeItems || []),
        ...(item.attribute?.recipeItems || []),
      ];

      for (const recipe of recipes) {
        // Fetch inventory item to get its base unit
        const inventoryItem = await tx.inventoryItem.findUnique({
          where: { id: recipe.inventoryItemId },
          include: { conversions: true },
        });

        if (!inventoryItem) continue;

        let totalDeduction = Number(recipe.quantity) * item.quantity;

        // Convert if recipe unit differs from inventory item unit
        if (recipe.unit !== inventoryItem.unit) {
          const conversion = inventoryItem.conversions.find(c => c.unit === recipe.unit);
          if (conversion) {
            totalDeduction = totalDeduction * Number(conversion.factor);
          } else {
            // Fallback or error? For now assume it's same, or throw error
            console.error(`Missing conversion for ${recipe.inventoryItemId} from ${recipe.unit} to ${inventoryItem.unit}`);
          }
        }

        await tx.inventoryTransaction.create({
          data: {
            inventoryItemId: recipe.inventoryItemId,
            type: "SALE",
            quantity: -totalDeduction,
            orderId: orderId,
            reason: `Order #${order.orderNumber}`,
          },
        });

        await tx.inventoryItem.update({
          where: { id: recipe.inventoryItemId },
          data: {
            stockAmount: {
              decrement: totalDeduction,
            },
          },
        });
        
        await updateAffectedProductsAvailability(tx, recipe.inventoryItemId);
      }
    }
  });

  revalidatePath("/inventory");
  revalidatePath("/products");
}

async function updateAffectedProductsAvailability(tx: any, inventoryItemId: string) {
  const recipes = await tx.recipeItem.findMany({
    where: { inventoryItemId },
    select: { productId: true, variantId: true },
  });

  const productIds = Array.from(new Set(recipes.map((r: any) => r.productId).filter(Boolean))) as string[];
  const variantIds = new Set(recipes.map((r: any) => r.variantId).filter(Boolean)) as Set<string>;

  for (const productId of productIds) {
    await checkAndSetProductAvailability(tx, productId);
    
    // When a base ingredient changes, it affects ALL variants of that product
    const productVariants = await tx.productVariant.findMany({
      where: { productId: productId },
      select: { id: true },
    });
    
    for (const variant of productVariants) {
      variantIds.add(variant.id);
    }
  }

  for (const variantId of variantIds) {
    await checkAndSetVariantAvailability(tx, variantId);
  }
}

async function calculateRequirements(tx: any, recipeItems: any[]) {
  const requirements: Record<string, number> = {};
  
  for (const recipe of recipeItems) {
    const itemId = recipe.inventoryItemId;
    
    // Fetch inventory item with conversions to handle units
    const inventoryItem = await tx.inventoryItem.findUnique({
      where: { id: itemId },
      include: { conversions: true },
    });

    if (!inventoryItem) continue;

    let requiredAmount = Number(recipe.quantity);

    // Convert if recipe unit differs from inventory item unit
    if (recipe.unit !== inventoryItem.unit) {
      const conversion = inventoryItem.conversions.find((c: any) => c.unit === recipe.unit);
      if (conversion) {
        requiredAmount = requiredAmount * Number(conversion.factor);
      } else {
        console.error(`Missing conversion for ${itemId} from ${recipe.unit} to ${inventoryItem.unit}`);
      }
    }

    requirements[itemId] = (requirements[itemId] || 0) + requiredAmount;
  }
  
  return requirements;
}

export async function checkAndSetProductAvailability(tx: any, productId: string) {
  const recipeItems = await tx.recipeItem.findMany({
    where: { 
      productId: productId,
      variantId: null,
      attributeId: null
    }
  });

  const requirements = await calculateRequirements(tx, recipeItems);

  let isAvailable = true;
  for (const itemId in requirements) {
    const required = requirements[itemId];
    const item = await tx.inventoryItem.findUnique({ where: { id: itemId } });
    if (!item) { isAvailable = false; break; }
    
    const stock = Number(item.stockAmount);
    if (stock < required) {
      isAvailable = false;
      break;
    }
  }

  await tx.product.update({
    where: { id: productId },
    data: { isAvailable },
  });
}

export async function checkAndSetVariantAvailability(tx: any, variantId: string) {
  const variant = await tx.productVariant.findUnique({
    where: { id: variantId },
    select: { productId: true },
  });
  if (!variant) return;

  const baseRecipeItems = await tx.recipeItem.findMany({
    where: {
      productId: variant.productId,
      variantId: null,
      attributeId: null
    }
  });

  const variantRecipeItems = await tx.recipeItem.findMany({
    where: { variantId: variantId }
  });

  const recipeItems = [...baseRecipeItems, ...variantRecipeItems];
  const requirements = await calculateRequirements(tx, recipeItems);

  let isAvailable = true;
  for (const itemId in requirements) {
    const required = requirements[itemId];
    const item = await tx.inventoryItem.findUnique({ where: { id: itemId } });
    if (!item) { isAvailable = false; break; }
    
    const stock = Number(item.stockAmount);
    if (stock < required) {
      isAvailable = false;
      break;
    }
  }

  await tx.productVariant.update({
    where: { id: variantId },
    data: { isAvailable },
  });
}

export async function getLowStockItems(branchId: string) {
  const items = await prisma.inventoryItem.findMany({
    where: {
      branchId,
      minStockLevel: { not: null },
      stockAmount: { lte: prisma.inventoryItem.fields.minStockLevel as any },
    },
  });
  return serialize(items);
}

export async function getInventoryTransactions(inventoryItemId: string) {
  const transactions = await prisma.inventoryTransaction.findMany({
    where: { inventoryItemId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return serialize(transactions);
}

export async function getInventoryItems(branchId: string) {
  const items = await prisma.inventoryItem.findMany({
    where: { branchId },
    include: {
      conversions: true,
      inventoryCategory: true,
      _count: {
        select: { recipeItems: true },
      },
    },
  });

  return serialize(items);
}

export async function linkRecipeToProduct(data: RecipeItemInput) {
  const { productId, variantId, attributeId, inventoryItemId, quantity, unit } = data;
  
  const recipe = await prisma.recipeItem.create({
    data: {
      productId,
      variantId,
      attributeId,
      inventoryItemId,
      quantity,
      unit,
    },
    include: {
        inventoryItem: true,
        variant: true
    }
  });

  if (productId) await checkAndSetProductAvailability(prisma, productId);
  if (variantId) await checkAndSetVariantAvailability(prisma, variantId);

  revalidatePath("/products");
  return serialize(recipe);
}

export async function removeRecipeFromProduct(recipeItemId: string) {
  const recipe = await prisma.recipeItem.delete({
    where: { id: recipeItemId },
  });

  if (recipe.productId) await checkAndSetProductAvailability(prisma, recipe.productId);
  if (recipe.variantId) await checkAndSetVariantAvailability(prisma, recipe.variantId);

  revalidatePath("/products");
  return { success: true };
}
