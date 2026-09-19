import { z } from "zod";

export const BusinessSchema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  branchName: z.string().min(2, "Main branch name must be at least 2 characters"),
});

export type BusinessInput = z.infer<typeof BusinessSchema>;
