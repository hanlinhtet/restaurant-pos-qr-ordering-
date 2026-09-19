import { z } from "zod";

export const TableSchema = z.object({
  number: z.string().regex(/^T\d+$/, "Table number must start with 'T' followed by digits (e.g., T01)"),
  capacity: z.coerce.number().optional().default(0),
});
