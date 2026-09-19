import prisma from "@/lib/prisma";
import { protectPage } from "@/modules/auth/utils/rbac";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderActionButtons } from "@/modules/orders/components/OrderActionButtons";
import { OrderFilters } from "@/modules/orders/components/OrderFilters";
import { getOrders } from "@/modules/orders/services/orderQueryService";
import { AlertCircle, Send } from "lucide-react";
import { AdminNotesInput } from "@/modules/orders/components/AdminNotesInput";
import { OrderCancelButton } from "@/modules/orders/components/OrderCancelButton";
import { cn } from "@/lib/utils";

interface OrdersPageProps {
  searchParams: Promise<{
    search?: string;
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    preset?: string;
  }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const session = await protectPage([UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF]);

  const businessUser = await prisma.businessUser.findFirst({
    where: { userId: session.user.id }
  });

  if (!businessUser) return <div>No business found.</div>;
  const businessId = businessUser.businessId;

  const filters = await searchParams;
  const rawOrders = await getOrders(businessId, {
    ...filters,
    type: filters.type as any,
    preset: filters.preset || "today",
  });

  const orders = rawOrders.map(order => ({
    ...order,
    totalAmount: Number(order.totalAmount),
    items: order.items.map(item => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal)
    }))
  }));

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
          <p className="text-muted-foreground mt-2">Manage and view customer orders.</p>
        </div>
      </div>

      <OrderFilters />

      <div className="grid gap-6">
        {orders.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed">
            <p className="text-muted-foreground">No orders found matching your filters.</p>
          </div>
        ) : (
          orders.map((order) => (
            <Card key={order.id} className={cn(
                "overflow-hidden transition-all duration-500",
                order.status === 'READY' ? "ring-2 ring-green-500 shadow-lg shadow-green-100 animate-pulse-subtle" : ""
            )}>
              <CardHeader className={cn(
                  "border-b flex flex-row items-center justify-between py-4",
                  order.status === 'READY' ? "bg-green-50" : "bg-slate-50"
              )}>
                <div className="space-y-1">
                  <CardTitle className="text-lg">Order {order.orderNumber}</CardTitle>
                  <div className="text-sm text-slate-500">
                    {order.tableSession?.table.number ? `Table ${order.tableSession.table.number}` : "No Table"} • {order.createdAt.toLocaleString()}
                  </div>
                  <div className="flex gap-2 mt-1">
                      <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${order.type === 'TAKEAWAY' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                          {order.type ? order.type.replace('_', ' ') : 'DINE IN'}
                      </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className={cn(
                      "px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide",
                      order.status === 'CANCELLED' ? "bg-red-100 text-red-700" : 
                      order.status === 'COMPLETED' ? "bg-slate-100 text-slate-700" :
                      order.status === 'READY' ? "bg-green-100 text-green-700" :
                      "bg-primary/10 text-primary"
                  )}>
                      {order.status}
                  </div>
                  <OrderActionButtons order={order} />
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">{item.product.name}</div>
                        <div className="text-sm text-slate-500">
                          {item.variant?.name || ""} {item.attribute?.content ? `- ${item.attribute.content}` : ""}
                        </div>
                        {item.notes && <div className="text-xs text-orange-600 mt-1 italic">Note: {item.notes}</div>}
                      </div>
                      <div className="font-medium">x{item.quantity}</div>
                    </div>
                  ))}
                </div>

                {order.report && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl space-y-3">
                        <div className="flex items-center gap-2 text-red-700 font-bold text-sm uppercase tracking-tight">
                            <AlertCircle className="w-4 h-4" />
                            Chef Report: {order.report.type.replace('_', ' ')}
                        </div>
                        <p className="text-sm text-red-600 font-medium italic">
                            "{order.report.description}"
                        </p>
                        
                        <div className="pt-2 space-y-2">
                             <label className="text-[10px] font-black uppercase text-slate-400">Admin Response to Customer</label>
                             <AdminNotesInput orderId={order.id} initialNotes={order.report.adminNotes || ""} disabled={order.status === 'CANCELLED'} />
                        </div>
                    </div>
                )}

                <div className="mt-6 pt-4 border-t flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{Number(order.totalAmount).toLocaleString()} MMK</span>
                </div>

                {!order.payments.some(p => p.status === 'PAID') && (
                  <div className="mt-4 flex justify-end">
                    <OrderCancelButton orderId={order.id} status={order.status} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
