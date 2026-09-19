"use server";

import prisma from "@/lib/prisma";
import { ProductSchema, ProductInput } from "../validations/product";
import { revalidatePath } from "next/cache";

export async function getProducts(businessId: string) {
  const products = await prisma.product.findMany({
    where: { businessId },
    include: { category: true, variants: true, attributes: true, flavours: true },
  });

  // Fetch product order counts
  const orderCounts = await prisma.orderItem.groupBy({
    by: ['productId'],
    _count: { productId: true },
    where: { order: { branch: { businessId } } }
  });

  const countMap = new Map(orderCounts.map(item => [item.productId, item._count.productId]));

  return products.map((p) => ({
    ...p,
    orderCount: countMap.get(p.id) || 0,
    price: p.price ? Number(p.price) : null,
    variants: p.variants.map(v => ({ ...v, price: Number(v.price) })),
    attributes: p.attributes.map(a => ({ 
      name: a.name, 
      content: a.content, 
      price: Number(a.price), 
      disable: a.disable,
      flavourItemId: a.flavourItemId 
    })),
    flavours: p.flavours.map(f => ({
      ...f,
      stockAmount: Number(f.stockAmount),
      minStockLevel: f.minStockLevel ? Number(f.minStockLevel) : null,
      costPerUnit: f.costPerUnit ? Number(f.costPerUnit) : null
    }))
  }));
}

export async function createProduct(businessId: string, values: ProductInput) {
  const validated = ProductSchema.safeParse(values);
  if (!validated.success) {
    console.error("Validation error:", validated.error.format());
    return { error: "Invalid product data" };
  }

  const { name, description, recipeInstructions, categoryId, image, variants, attributes, flavourIds, applyAttribute, applyPortion } = validated.data;

  try {
    await prisma.product.create({
      data: {
        name,
        description,
        recipeInstructions,
        categoryId,
        image,
        businessId,
        applyAttribute: !!applyAttribute,
        applyPortion: !!applyPortion,
        variants: {
          create: (variants || []).map(v => ({
            name: v.name,
            price: v.price,
            portion: v.portion,
          })),
        },
        attributes: {
          create: (attributes || []).map(a => ({ 
            name: a.name, 
            content: a.name,
            price: a.price,
            flavourItemId: a.flavourItemId,
            disable: !applyAttribute 
          })),
        },
        flavours: {
            connect: (flavourIds || []).map(id => ({ id }))
        }
      },
    });
    revalidatePath("/products");
    return { success: "Product created" };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong" };
  }
}

export async function updateProduct(productId: string, values: ProductInput) {
  console.log("Updating product with values:", JSON.stringify(values, null, 2));
  const validated = ProductSchema.safeParse(values);
  if (!validated.success) {
    console.error("Validation error:", validated.error.format());
    return { error: "Invalid product data" };
  }

  const { name, description, recipeInstructions, categoryId, image, variants, attributes, flavourIds, applyAttribute, applyPortion } = validated.data;
  console.log("Extracted flavourIds:", flavourIds);

  try {
    const updated = await prisma.product.update({
      where: { id: productId },
      include: { flavours: true },
      data: {
        name,
        description,
        recipeInstructions,
        categoryId,
        image,
        applyAttribute: !!applyAttribute,
        applyPortion: !!applyPortion,
        variants: {
          deleteMany: {},
          create: (variants || []).map(v => ({
            name: v.name,
            price: v.price,
            portion: v.portion,
          })),
        },
        attributes: {
          deleteMany: {},
          create: (attributes || []).map(a => ({ 
            name: a.name, 
            content: a.name,
            price: a.price,
            flavourItemId: a.flavourItemId,
            disable: !applyAttribute 
          })),
        },
        flavours: {
            set: (flavourIds || []).map(id => ({ id }))
        }
      },
    });
    console.log("Prisma update result flavours count:", updated.flavours.length);
    revalidatePath("/products");
    return { success: "Product updated" };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong" };
  }
}

export async function updateProductRecipeInstructions(productId: string, instructions: string) {
  try {
    await prisma.product.update({
      where: { id: productId },
      data: { recipeInstructions: instructions },
    });
    revalidatePath("/products");
    return { success: "Recipe instructions updated" };
  } catch (error) {
    console.error(error);
    return { error: "Failed to update instructions" };
  }
}

export async function deleteProduct(productId: string) {
  try {
    await prisma.$transaction([
      prisma.productVariant.deleteMany({ where: { productId } }),
      prisma.productAttribute.deleteMany({ where: { productId } }),
      prisma.product.delete({ where: { id: productId } })
    ]);
    revalidatePath("/products");
    return { success: "Product deleted" };
  } catch (error) {
    console.error(error);
    return { error: "Failed to delete" };
  }
}
