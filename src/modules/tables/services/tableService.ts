import prisma from "@/lib/prisma";

export async function getTables(branchId: string) {
  // Auto-cleanup idle sessions (> 1 min) with no orders
  const idleThreshold = new Date(Date.now() - 60000);
  
  const idleSessions = await prisma.tableSession.findMany({
    where: { 
        active: true, 
        lastActivity: { lt: idleThreshold },
        orders: { none: {} }
    }
  });

  if (idleSessions.length > 0) {
    const tableIds = idleSessions.map(s => s.tableId);
    const sessionIds = idleSessions.map(s => s.id);

    await prisma.$transaction([
        prisma.tableSession.updateMany({
            where: { id: { in: sessionIds } },
            data: { active: false }
        }),
        prisma.table.updateMany({
            where: { id: { in: tableIds } },
            data: { status: "FREE" }
        })
    ]);
  }

  const tables = await prisma.table.findMany({
    where: { branchId },
    include: {
        sessions: {
            where: { active: true },
            include: { orders: true }
        }
    },
    orderBy: { number: "asc" },
  });

  return tables.map(table => ({
    ...table,
    sessions: table.sessions.map(session => ({
        ...session,
        orders: session.orders.map(order => ({
            ...order,
            totalAmount: Number(order.totalAmount)
        }))
    }))
  }));
}

export async function getTablesByBusiness(businessId: string) {
  // Logic here same as getTables for consistency (DRY: could refactor but keeping surgical)
  const idleThreshold = new Date(Date.now() - 60000);
  const idleSessions = await prisma.tableSession.findMany({
    where: { 
        active: true, 
        lastActivity: { lt: idleThreshold },
        orders: { none: {} }
    }
  });

  if (idleSessions.length > 0) {
    const tableIds = idleSessions.map(s => s.tableId);
    const sessionIds = idleSessions.map(s => s.id);
    await prisma.$transaction([
        prisma.tableSession.updateMany({ where: { id: { in: sessionIds } }, data: { active: false } }),
        prisma.table.updateMany({ where: { id: { in: tableIds } }, data: { status: "FREE" } })
    ]);
  }

  const tables = await prisma.table.findMany({
    where: { branch: { businessId } },
    include: {
        sessions: {
            where: { active: true },
            include: { orders: true }
        }
    },
    orderBy: { number: "asc" },
  });

  return tables.map(table => ({
    ...table,
    sessions: table.sessions.map(session => ({
        ...session,
        orders: session.orders.map(order => ({
            ...order,
            totalAmount: Number(order.totalAmount)
        }))
    }))
  }));
}

export async function createTable(branchId: string, data: { number: string; capacity: number }) {
  return await prisma.table.create({
    data: {
      ...data,
      branchId,
    },
  });
}

export async function deleteTable(id: string) {
  return await prisma.table.delete({ where: { id } });
}
