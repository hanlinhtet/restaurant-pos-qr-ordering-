"use server";

import prisma from "@/lib/prisma";
import { OrderWithDetails } from "../types";
import { startOfDay, endOfDay } from "date-fns";

export interface OrderFilters {
  search?: string;
  type?: "DINE_IN" | "TAKEAWAY" | "all";
  status?: string | "all";
  startDate?: string;
  endDate?: string;
  preset?: string;
}

export async function getOrders(businessId: string, filters: OrderFilters): Promise<OrderWithDetails[]> {
  const { search, type, status, startDate, endDate, preset } = filters;

  const where: any = {
    branch: { businessId },
  };

  if (type && type !== "all") {
    where.type = type;
  }

  if (status && status !== "all") {
    where.status = status;
  }

  // Handle Date Range
  const now = new Date();
  let start: Date = startOfDay(now);
  let end: Date = endOfDay(now);

  if (preset === "yesterday") {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    start = startOfDay(yesterday);
    end = endOfDay(yesterday);
  } else if (preset === "last7") {
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    start = startOfDay(sevenDaysAgo);
    end = endOfDay(now);
  } else if (preset === "last30") {
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    start = startOfDay(thirtyDaysAgo);
    end = endOfDay(now);
  } else if (preset === "custom" && (startDate || endDate)) {
    if (startDate) start = startOfDay(new Date(startDate));
    if (endDate) end = endOfDay(new Date(endDate));
  } else if (preset === "all") {
      // Don't set createdAt filter to show all time
      delete where.createdAt;
  }

  if (preset !== "all") {
      where.createdAt = {
        gte: start,
        lte: end,
      };
  }

  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: "insensitive" } },
      {
        tableSession: {
          table: {
            number: { contains: search, mode: "insensitive" },
          },
        },
      },
    ];
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      items: {
        include: { product: true, variant: true, attribute: true },
      },
      tableSession: {
        include: { table: true },
      },
      report: true,
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Serialize all Decimals to numbers for Client Components
  return orders.map(order => ({
    ...order,
    totalAmount: Number(order.totalAmount),
    payments: order.payments.map(p => ({
        ...p,
        amount: Number(p.amount)
    })),
    items: order.items.map(item => ({
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
  })) as any;
}
