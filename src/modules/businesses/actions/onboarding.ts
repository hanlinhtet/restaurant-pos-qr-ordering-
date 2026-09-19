"use server";

import prisma from "@/lib/prisma";
import { BusinessSchema, BusinessInput } from "../validations/onboarding";

export async function createBusiness(values: BusinessInput, userId: string) {
  const validatedFields = BusinessSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { name, slug, branchName } = validatedFields.data;

  try {
    // 1. Check if slug exists
    const existingBusiness = await prisma.business.findUnique({
      where: { slug },
    });

    if (existingBusiness) {
      return { error: "Business URL (slug) is already taken. Please try another one." };
    }

    // 2. Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return { error: "User not found. Please log in again." };
    }

    // 3. Create business with branch and user link
    const business = await prisma.business.create({
      data: {
        name,
        slug,
        users: {
          create: {
            userId: userId,
          }
        },
        branches: {
          create: {
            name: branchName,
          }
        }
      },
    });

    // 4. Set the creator as OWNER
    await prisma.user.update({
      where: { id: userId },
      data: { role: "OWNER" }
    });

    return { success: "Business created!", businessId: business.id };
  } catch (error) {
    console.error("[ONBOARDING_ERROR]", error);
    return { error: "An unexpected error occurred during registration. Please try again." };
  }
}
