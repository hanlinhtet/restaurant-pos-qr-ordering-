"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function cancelOrderAction(orderId: string) {
  await prisma.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED" }
  });
  
  revalidatePath("/orders");
  revalidatePath("/kitchen");
  revalidatePath("/dashboard");
  return { success: true };
}
