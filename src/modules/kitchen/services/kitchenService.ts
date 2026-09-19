import prisma from "@/lib/prisma";
import { deductStockFromOrder } from "@/modules/inventory/services/inventory.service";

export async function getActiveKitchenTickets(branchId: string) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const tickets = await prisma.kitchenTicket.findMany({
    where: {
      order: {
        branchId: branchId
      },
      status: {
        in: ["CONFIRMED", "PREPARING", "READY", "CANCELLED", "COMPLETED"]
      },
      createdAt: {
        gte: startOfToday,
        lte: endOfToday
      }
    },
    include: {
      order: {
        include: {
          items: {
            include: {
              product: true,
              variant: true,
              attribute: true
            }
          },
          tableSession: {
            include: {
              table: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: "desc" // Newest first for "printing" feel
    }
  });

  // Serialize Decimals for the order and all nested relations
  return tickets.map(ticket => ({
    ...ticket,
    status: ticket.order.status === 'COMPLETED' ? 'COMPLETED' : ticket.status,
    order: {
      ...ticket.order,
      totalAmount: Number(ticket.order.totalAmount),
      items: ticket.order.items.map(item => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
        product: {
          ...item.product,
          price: item.product.price ? Number(item.product.price) : null
        },
        variant: item.variant ? {
          ...item.variant,
          price: Number(item.variant.price)
        } : null
      }))
    }
  }));
}

export async function updateKitchenTicketStatus(ticketId: string, status: any) {
  const ticket = await prisma.kitchenTicket.update({
    where: { id: ticketId },
    data: { status },
    include: { order: true }
  });

  // Also update the order status
  await prisma.order.update({
    where: { id: ticket.orderId },
    data: { status }
  });

  if (status === "PREPARING") {
    await deductStockFromOrder(ticket.orderId);
  }

  return ticket;
}
