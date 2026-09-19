import { protectPage } from "@/modules/auth/utils/rbac";
import { UserRole } from "@prisma/client";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { FloorPlanPreview } from "@/modules/tables/components/FloorPlanPreview";
import { LiveActivityTracker } from "@/modules/dashboard/components/LiveActivityTracker";
import { cleanupExpiredSessions } from "@/modules/tables/services/sessionService";

export default async function DashboardPage() {
  const session = await protectPage([UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF], true);

  // Get the user's business
  const businessUser = await prisma.businessUser.findFirst({
    where: { userId: session.user.id }
  });

  if (!businessUser) return <div>No business found.</div>;
  const businessId = businessUser.businessId;

  // Cleanup expired "Check Menu" sessions before rendering
  await cleanupExpiredSessions();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const [revenue, orders, activeTables, totalTables, kitchenQueue, productCount, tables] = await Promise.all([
    prisma.payment.aggregate({ 
        where: { order: { branch: { businessId } }, createdAt: { gte: startOfToday, lte: endOfToday } },
        _sum: { amount: true } 
    }),
    prisma.order.count({ 
        where: { 
            branch: { businessId }, 
            OR: [
                { payments: { some: { status: "PAID" } } },
                { status: "COMPLETED" }
            ],
            createdAt: { gte: startOfToday, lte: endOfToday } 
        } 
    }),
    prisma.tableSession.count({ where: { table: { branch: { businessId: businessId } }, active: true } }),
    prisma.table.count({ where: { branch: { businessId } } }),
    prisma.kitchenTicket.count({ 
        where: { 
            order: { branch: { businessId } }, 
            status: "CONFIRMED",
            createdAt: { gte: startOfToday, lte: endOfToday }
        } 
    }),
    prisma.product.count({ where: { businessId } }),
    prisma.table.findMany({ 
        where: { branch: { businessId } },
        include: { 
            sessions: { 
                where: { 
                    OR: [
                        { active: true },
                        { createdAt: { gte: startOfToday, lte: endOfToday } }
                    ]
                },
                include: { orders: { where: { createdAt: { gte: startOfToday, lte: endOfToday } } } },
                orderBy: { createdAt: "desc" },
                take: 1
            } 
        }
    }),
  ]);

  const serializedTables = tables.map(table => ({
    ...table,
    sessions: table.sessions.map(session => ({
        ...session,
        orders: session.orders.map(order => ({
            ...order,
            totalAmount: Number(order.totalAmount)
        }))
    }))
  }));

  return (
    <div className="p-8 space-y-8">
      <LiveActivityTracker />
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground mt-2">Welcome back to your POS management system.</p>
      </div>
      
      {/* Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <MetricCard title="Total Revenue">
            <span className="text-2xl font-bold">{Number(revenue._sum.amount || 0).toLocaleString()}</span>
            <span className="text-sm font-medium text-muted-foreground ml-1">MMK</span>
        </MetricCard>
        <MetricCard title="Total Orders">{orders.toString()}</MetricCard>
        <MetricCard title="Active Tables">{`${activeTables} / ${totalTables}`}</MetricCard>
        <MetricCard title="Kitchen Queue">{kitchenQueue.toString()}</MetricCard>
        <MetricCard title="Product Count">{productCount.toString()}</MetricCard>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {/* Left 3 columns: Floor Plan Preview */}
        <div className="md:col-span-3 rounded-xl border bg-card p-6 shadow">
            <h3 className="text-lg font-semibold mb-4">Table Positions</h3>
            <FloorPlanPreview tables={serializedTables} />
        </div>

        <div className="md:col-span-1 rounded-xl border bg-card p-6 shadow space-y-6">
            <h3 className="text-lg font-semibold">Free Tables</h3>
            <FreeTablesList businessId={businessId} />
        </div>
      </div>
    </div>
  );
}

async function FreeTablesList({ businessId }: { businessId: string }) {
    const freeTables = await prisma.table.findMany({
        where: { branch: { businessId }, sessions: { none: { active: true } } }
    });
    
    return (
        <div className="space-y-2">
            {freeTables.length === 0 && <p className="text-sm text-muted-foreground">No free tables.</p>}
            {freeTables.map(t => (
                <div key={t.id} className="p-2 bg-slate-50 rounded text-sm font-medium border">Table {t.number}</div>
            ))}
        </div>
    )
}

function MetricCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{title}</h3>
          <div className="text-2xl font-bold mt-2">{children}</div>
        </div>
    )
}
