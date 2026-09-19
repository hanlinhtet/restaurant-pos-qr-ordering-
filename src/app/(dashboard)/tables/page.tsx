import { protectPage } from "@/modules/auth/utils/rbac";
import { UserRole } from "@prisma/client";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getTables } from "@/modules/tables/services/tableService";
import { TableList } from "@/modules/tables/components/TableList";

export default async function TablesPage() {
  const session = await protectPage([UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF]);

  const businessUser = await prisma.businessUser.findFirst({
    where: { userId: session.user.id },
    include: { business: { include: { branches: true } } }
  });

  const branch = businessUser?.business?.branches?.[0];
  if (!branch) redirect("/onboarding");

  const tables = await getTables(branch.id);

  const activeTables = tables.filter((t: any) => t.sessions.length > 0).length;
  const totalTables = tables.length;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">Tables</h2>
            <p className="text-muted-foreground mt-1">
                Manage your restaurant seating layout. Active tables: 
                <span className="font-bold text-slate-800 ml-1">{activeTables}/{totalTables}</span>
            </p>
        </div>
      </div>
      <TableList tables={tables} branchId={branch.id} />
    </div>
  );
}
