"use server";

import prisma from "@/lib/prisma";
import { getActiveOrderByTable } from "../services/orderService";
import { revalidatePath } from "next/cache";

export async function getActiveOrderByTableAction(tableId: string) {
  const order = await prisma.order.findFirst({
    where: {
      tableSession: {
        tableId: tableId,
        active: true
      },
      status: {
        not: "COMPLETED"
      }
    },
    include: {
      branch: true,
      report: true,
      payments: true,
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
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  if (!order) return null;

  // Serialize Decimals for the order and all nested relations
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    type: order.type,
    totalAmount: Number(order.totalAmount),
    branchId: order.branchId,
    branch: order.branch,
    report: order.report,
    payments: order.payments.map(p => ({ ...p, amount: Number(p.amount) })),
    tableSessionId: order.tableSessionId,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    items: order.items.map((item: any) => ({
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      variantId: item.variantId,
      attributeId: item.attributeId,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      subtotal: Number(item.subtotal),
      notes: item.notes,
      product: {
        id: item.product.id,
        name: item.product.name,
        price: item.product.price ? Number(item.product.price) : null,
        image: item.product.image
      },
      variant: item.variant ? {
        id: item.variant.id,
        name: item.variant.name,
        price: Number(item.variant.price)
      } : null,
      attribute: item.attribute ? {
          id: item.attribute.id,
          name: item.attribute.name,
          content: item.attribute.content
      } : null
    }))
  };
}

export async function getOrderByIdAction(id: string) {
    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            payments: true,
            items: {
                include: {
                    product: true,
                    variant: true,
                    attribute: true
                }
            },
            tableSession: {
                include: { table: true }
            }
        }
    });

    if (!order) return null;

    return {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        type: order.type,
        totalAmount: Number(order.totalAmount),
        branchId: order.branchId,
        payments: order.payments.map(p => ({ ...p, amount: Number(p.amount) })),
        tableSessionId: order.tableSessionId,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.items.map((item: any) => ({
            id: item.id,
            orderId: item.orderId,
            productId: item.productId,
            variantId: item.variantId,
            attributeId: item.attributeId,
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
            subtotal: Number(item.subtotal),
            notes: item.notes,
            product: {
                id: item.product.id,
                name: item.product.name,
                price: item.product.price ? Number(item.product.price) : null,
                image: item.product.image
            },
            variant: item.variant ? {
                id: item.variant.id,
                name: item.variant.name,
                price: Number(item.variant.price)
            } : null,
            attribute: item.attribute ? {
                id: item.attribute.id,
                name: item.attribute.name,
                content: item.attribute.content
            } : null
        }))
    };
}

import { deductStockFromOrder } from "../../inventory/services/inventory.service";

export async function updateOrderStatusAction(id: string, status: any) {
    const data: any = { status };

    // If order is confirmed, create a kitchen ticket
    if (status === 'CONFIRMED') {
        await prisma.kitchenTicket.create({
            data: {
                orderId: id,
                status: 'CONFIRMED'
            }
        });
    }

    await prisma.order.update({
        where: { id },
        data
    });
    revalidatePath("/orders");
    revalidatePath("/dashboard");
    return { success: true };
}

export async function deleteOrderAction(id: string) {
    await prisma.order.delete({
        where: { id }
    });
    revalidatePath("/dashboard");
    revalidatePath("/orders");
    return { success: true };
}

export async function markAsPaidAction(orderId: string) {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { payments: true }
    });

    if (!order) return { success: false, error: "Order not found" };
    
    // Create Payment record if not already paid
    const isAlreadyPaid = order.payments.some(p => p.status === 'PAID');
    if (!isAlreadyPaid) {
        await prisma.payment.create({
            data: {
                amount: order.totalAmount,
                status: "PAID",
                method: "CASH", // Default
                orderId: order.id
            }
        });
    }

    revalidatePath("/orders");
    revalidatePath("/dashboard");
    return { success: true };
}

export async function completeOrderAndCloseSessionAction(orderId: string) {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { tableSession: true, payments: true }
    });

    if (!order) return { success: false, error: "Order not found" };

    // 1. Mark order as COMPLETED
    await prisma.order.update({
        where: { id: orderId },
        data: { status: "COMPLETED" }
    });

    // 2. Create Payment record ONLY if not already paid
    const isAlreadyPaid = order.payments.some(p => p.status === 'PAID');
    if (!isAlreadyPaid) {
        await prisma.payment.create({
            data: {
                amount: order.totalAmount,
                status: "PAID",
                method: "CASH", // Default for now
                orderId: order.id
            }
        });
    }

    // 3. Close Table Session
    if (order.tableSessionId && order.tableSession) {
        await prisma.tableSession.update({
            where: { id: order.tableSessionId },
            data: { active: false, endedAt: new Date() }
        });
        
        // 4. Reset Table Status
        await prisma.table.update({
            where: { id: order.tableSession.tableId },
            data: { status: "FREE" }
        });
    }

    revalidatePath("/dashboard");
    revalidatePath("/orders");
    return { success: true };
}
