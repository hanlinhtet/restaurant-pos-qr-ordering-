"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createOrder(data: {
  tableId: string;
  orderType: "dine-in" | "takeaway";
  items: any[];
  total: number;
}) {
  const { tableId, orderType, items, total } = data;

  const table = await prisma.table.findUnique({
    where: { id: tableId },
    include: { branch: true }
  });

  if (!table) return { success: false, error: "Table not found" };

  // 1. Find or create active table session
  let session = await prisma.tableSession.findFirst({
    where: { tableId, active: true }
  });

  if (!session) {
    session = await prisma.tableSession.create({
      data: { tableId, active: true }
    });
  }

  // New Step: Avoid duplicates - delete any existing PENDING order for this session
  // This allows "Add More Items" to act as an "Edit Order" for pending states.
  await prisma.order.deleteMany({
    where: {
      tableSessionId: session.id,
      status: "PENDING"
    }
  });

  // 2. Create the order
  const order = await prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
      totalAmount: total,
      type: orderType === "dine-in" ? "DINE_IN" : "TAKEAWAY",
      branch: { connect: { id: table.branchId } },
      tableSession: { connect: { id: session.id } },
      status: "PENDING",
      items: {
        create: items.map(item => {
          const itemData: any = {
            product: { connect: { id: item.id } },
            quantity: item.quantity,
            unitPrice: item.price,
            subtotal: item.price * item.quantity,
            notes: item.notes || "",
          };
          
          if (item.variant?.id) {
            itemData.variant = { connect: { id: item.variant.id } };
          }
          if (item.attribute?.id) {
            itemData.attribute = { connect: { id: item.attribute.id } };
          }
          
          return itemData;
        })
      }
    }
  });

  // 3. Update Table Status to ORDERING
  await prisma.table.update({
    where: { id: tableId },
    data: { status: "ORDERING" }
  });

  revalidatePath("/dashboard");
  revalidatePath("/orders");
  
  return { 
      success: true, 
      orderId: order.id,
      order: {
          ...order,
          totalAmount: Number(order.totalAmount),
      }
  };
}

import { startOfDay } from "date-fns";

export async function getActiveOrderByTable(tableId: string) {
  const startOfToday = startOfDay(new Date());

  const session = await prisma.tableSession.findFirst({
    where: { tableId, active: true },
    include: {
      orders: {
        where: { 
            status: { not: "COMPLETED" },
            createdAt: { gte: startOfToday } // Filter for current day
        }, 
        include: {
          items: {
            include: {
              product: true,
              variant: true,
              attribute: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 1
      }
    }
  });

  return session?.orders[0] || null;
}
