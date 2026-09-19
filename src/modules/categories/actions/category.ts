"use server";

import prisma from "@/lib/prisma";
import { CategorySchema, CategoryInput } from "../validations/category";
import { revalidatePath } from "next/cache";

export async function createCategory(businessId: string, values: CategoryInput) {
  const validated = CategorySchema.safeParse(values);
  if (!validated.success) return { error: "Invalid fields" };

  try {
    await prisma.category.create({
      data: {
        name: validated.data.name,
        businessId,
      },
    });
    revalidatePath("/categories");
    return { success: "Category created" };
  } catch {
    return { error: "Something went wrong" };
  }
}

export async function updateCategory(categoryId: string, values: CategoryInput) {
  const validated = CategorySchema.safeParse(values);
  if (!validated.success) return { error: "Invalid fields" };

  try {
    await prisma.category.update({
      where: { id: categoryId },
      data: { name: validated.data.name },
    });
    revalidatePath("/categories");
    return { success: "Category updated" };
  } catch {
    return { error: "Something went wrong" };
  }
}

export async function deleteCategory(categoryId: string) {
  try {
    await prisma.category.delete({
      where: { id: categoryId },
    });
    revalidatePath("/categories");
    return { success: "Category deleted" };
  } catch {
    return { error: "Failed to delete" };
  }
}

export async function getCategories(businessId: string) {
  return await prisma.category.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });
}
