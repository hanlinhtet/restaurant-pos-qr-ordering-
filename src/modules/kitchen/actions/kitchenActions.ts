"use server";

import prisma from "@/lib/prisma";
import { updateKitchenTicketStatus } from "../services/kitchenService";
import { revalidatePath } from "next/cache";

export async function completeTicketAction(ticketId: string) {
  await updateKitchenTicketStatus(ticketId, "READY");
  revalidatePath("/kitchen");
  revalidatePath("/orders");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function finalizeTicketAction(ticketId: string) {
    await updateKitchenTicketStatus(ticketId, "COMPLETED");
    revalidatePath("/kitchen");
    revalidatePath("/orders");
    revalidatePath("/dashboard");
    return { success: true };
}

export async function startTicketAction(ticketId: string) {
  await updateKitchenTicketStatus(ticketId, "PREPARING");
  revalidatePath("/kitchen");
  revalidatePath("/orders"); // Added to update customer/admin view
  return { success: true };
}

export async function reportProblemAction(ticketId: string, type: string, description: string) {
  const ticket = await prisma.kitchenTicket.findUnique({
    where: { id: ticketId },
    include: { order: true }
  });

  if (!ticket) return { success: false, error: "Ticket not found" };

  try {
    // Just create/update the report, do NOT cancel the order here.
    // The Admin/Customer will handle the cancellation.
    await prisma.orderReport.upsert({
      where: { orderId: ticket.orderId },
      update: { type, description },
      create: {
        orderId: ticket.orderId,
        type,
        description
      }
    });

    revalidatePath("/kitchen");
    revalidatePath("/orders");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("reportProblemAction error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Database error" };
  }
}

export async function updateAdminNotesAction(orderId: string, notes: string) {
  await prisma.orderReport.update({
    where: { orderId },
    data: { adminNotes: notes }
  });
  revalidatePath("/orders");
  return { success: true };
}
