import { z } from "zod";

export const ProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  recipeInstructions: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  image: z.string().optional(),
  attributes: z.array(z.object({
    name: z.string().min(1, "Attribute name is required"),
    price: z.coerce.number().min(0, "Price must be positive"),
    flavourItemId: z.string().optional(),
  })).optional(),
  flavourIds: z.array(z.string()).optional(),
  applyAttribute: z.boolean().optional(),
  applyPortion: z.boolean().optional(),
  variants: z.array(z.object({
    name: z.string().min(1, "Variant name is required"),
    price: z.coerce.number().min(0, "Price must be positive"),
    portion: z.preprocess(
      (val) => (val === "" || val === undefined || isNaN(Number(val)) ? null : Number(val)),
      z.number().nullable().optional()
    ),
  })).optional()
});

export type ProductInput = z.infer<typeof ProductSchema>;
