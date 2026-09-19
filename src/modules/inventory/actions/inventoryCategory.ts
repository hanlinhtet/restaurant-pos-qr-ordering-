"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createInventoryCategory(businessId: string, name: string) {
  try {
    await prisma.inventoryCategory.create({
      data: {
        name,
        businessId,
      },
    });
    revalidatePath("/inventory-categories");
    return { success: "Category created" };
  } catch {
    return { error: "Something went wrong" };
  }
}

export async function getInventoryCategories(businessId: string) {
  return await prisma.inventoryCategory.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteInventoryCategory(categoryId: string) {
  try {
    await prisma.inventoryCategory.delete({
      where: { id: categoryId },
    });
    revalidatePath("/inventory-categories");
    return { success: "Category deleted" };
  } catch {
    return { error: "Failed to delete" };
  }
}
