import { z } from "zod";
import { UnitOfMeasure, InventoryTransactionType } from "@prisma/client";

export const InventoryItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().optional(),
  image: z.string().optional(),
  unit: z.nativeEnum(UnitOfMeasure),
  minStockLevel: z.number().optional(),
  costPerUnit: z.number().optional(),
  inventoryCategoryId: z.string().optional(), // Updated from categoryId
  branchId: z.string().min(1, "Branch is required"),
  conversions: z.array(z.object({
    unit: z.nativeEnum(UnitOfMeasure),
    factor: z.number().positive("Factor must be positive"),
  })).optional(),
});

export type InventoryItemInput = z.infer<typeof InventoryItemSchema>;

export const RecipeItemSchema = z.object({
  inventoryItemId: z.string().min(1, "Inventory item is required"),
  quantity: z.number().positive("Quantity must be positive"),
  unit: z.nativeEnum(UnitOfMeasure),
  productId: z.string().optional(),
  variantId: z.string().optional(),
  attributeId: z.string().optional(),
});

export type RecipeItemInput = z.infer<typeof RecipeItemSchema>;

export const InventoryTransactionSchema = z.object({
  inventoryItemId: z.string().min(1, "Inventory item is required"),
  type: z.nativeEnum(InventoryTransactionType),
  quantity: z.number(),
  reason: z.string().optional(),
});

export type InventoryTransactionInput = z.infer<typeof InventoryTransactionSchema>;
