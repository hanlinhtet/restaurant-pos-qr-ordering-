"use server";

import prisma from "@/lib/prisma";
import { protectPage } from "@/modules/auth/utils/rbac";
import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";

const AddStaffSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.nativeEnum(UserRole),
});

export type AddStaffInput = z.infer<typeof AddStaffSchema>;

export async function getBusinessStaff(businessId: string) {
  await protectPage([UserRole.OWNER, UserRole.MANAGER]);

  const staff = await prisma.businessUser.findMany({
    where: { businessId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        }
      }
    }
  });

  return staff.map(s => s.user);
}

export async function addStaffAction(businessId: string, values: AddStaffInput) {
  const session = await protectPage([UserRole.OWNER]);

  const validated = AddStaffSchema.safeParse(values);
  if (!validated.success) {
    return { error: "Invalid data" };
  }

  const { name, email, password, role } = validated.data;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    
    if (existingUser) {
      // Check if already in this business
      const alreadyInBusiness = await prisma.businessUser.findUnique({
        where: {
          userId_businessId: {
            userId: existingUser.id,
            businessId
          }
        }
      });

      if (alreadyInBusiness) {
        return { error: "User is already a staff member in this business" };
      }

      // Link existing user to business
      await prisma.businessUser.create({
        data: {
          userId: existingUser.id,
          businessId
        }
      });
      
      // Update role if necessary (caution: this affects user globally)
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { role }
      });

    } else {
      // Create new user
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role
        }
      });

      await prisma.businessUser.create({
        data: {
          userId: newUser.id,
          businessId
        }
      });
    }

    revalidatePath("/staff");
    return { success: "Staff member added successfully" };
  } catch (error) {
    console.error(error);
    return { error: "Failed to add staff member" };
  }
}

export async function removeStaffAction(businessId: string, userId: string) {
  const session = await protectPage([UserRole.OWNER]);

  try {
    // We only remove the link, don't delete the user entirely?
    // In multi-tenant, removing from business is safer.
    await prisma.businessUser.delete({
      where: {
        userId_businessId: {
          userId,
          businessId
        }
      }
    });

    revalidatePath("/staff");
    return { success: "Staff member removed" };
  } catch (error) {
    console.error(error);
    return { error: "Failed to remove staff" };
  }
}
