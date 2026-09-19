import prisma from "@/lib/prisma";

export async function getBusinessInfo(tableId: string) {
  const table = await prisma.table.findUnique({
    where: { id: tableId },
    include: { branch: { include: { business: true } } }
  });
  
  if (!table) return null;
  return table.branch.business;
}
