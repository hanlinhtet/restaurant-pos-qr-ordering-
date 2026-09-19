import prisma from "@/lib/prisma";

export async function initializeTableSession(tableId: string) {
  // First, cleanup any expired sessions for this table
  await cleanupExpiredSessions(tableId);

  // Check if there is an existing active session
  const session = await prisma.tableSession.findFirst({
    where: { tableId, active: true }
  });
  
  return session;
}

export async function cleanupExpiredSessions(tableId?: string) {
    const timeoutMinutes = parseInt(process.env.SESSION_TIMEOUT_MINUTES || "3");
    const timeoutDate = new Date();
    timeoutDate.setMinutes(timeoutDate.getMinutes() - timeoutMinutes);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // 1. Cleanup inactive "Check Menu" sessions (no orders)
    const inactiveWhere: any = {
        active: true,
        lastActivity: { lt: timeoutDate },
        orders: { none: {} }
    };
    if (tableId) inactiveWhere.tableId = tableId;

    // 2. Cleanup ANY session from previous days (hard daily reset)
    const oldSessionWhere: any = {
        active: true,
        createdAt: { lt: startOfToday }
    };
    if (tableId) oldSessionWhere.tableId = tableId;

    const sessionsToCleanup = await prisma.tableSession.findMany({
        where: {
            OR: [inactiveWhere, oldSessionWhere]
        },
        select: { id: true, tableId: true }
    });

    if (sessionsToCleanup.length === 0) return;

    // Deactivate sessions
    await prisma.tableSession.updateMany({
        where: { id: { in: sessionsToCleanup.map(s => s.id) } },
        data: { active: false }
    });

    // Reset table statuses to FREE for these tables
    await prisma.table.updateMany({
        where: { id: { in: sessionsToCleanup.map(s => s.tableId) } },
        data: { status: "FREE" }
    });
}

export async function createTableSession(tableId: string) {
    // Safety check: Ensure the table actually exists
    const tableExists = await prisma.table.findUnique({
      where: { id: tableId }
    });

    if (!tableExists) {
      console.error(`Attempted to create session for non-existent table: ${tableId}`);
      return null;
    }

    const session = await prisma.tableSession.create({
      data: {
        tableId,
        active: true,
        lastActivity: new Date()
      }
    });

    // Update table status to CHECKING
    await prisma.table.update({
        where: { id: tableId },
        data: { status: "CHECKING" }
    });
    
    return session;
}

export async function updateSessionActivity(tableId: string) {
    const session = await prisma.tableSession.findFirst({
        where: { tableId, active: true }
    });

    if (session) {
        await prisma.tableSession.update({
            where: { id: session.id },
            data: { lastActivity: new Date() }
        });
    }
}
