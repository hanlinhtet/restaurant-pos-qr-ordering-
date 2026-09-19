"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const SettingsSchema = z.object({
  userName: z.string().min(2),
  businessName: z.string().min(2),
  address: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  logo: z.string().optional(),
});

export async function updateSettings(userId: string, businessId: string, branchId: string, values: z.infer<typeof SettingsSchema>) {
  const validatedFields = SettingsSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { userName, businessName, address, phone, website, logo } = validatedFields.data;

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { name: userName }
      }),
      prisma.business.update({
        where: { id: businessId },
        data: { 
          name: businessName,
          website,
          logo
        }
      }),
      prisma.branch.update({
        where: { id: branchId },
        data: {
          address,
          phone
        }
      })
    ]);

    revalidatePath("/", "layout");
    return { success: "Settings updated successfully!" };
  } catch (error) {
    console.error("[SETTINGS_UPDATE_ERROR]", error);
    return { error: "Failed to update settings." };
  }
}
