"use server";

import { getTables, createTable, deleteTable, getTablesByBusiness } from "../services/tableService";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function getTablesAction(branchId: string) {
  return await getTables(branchId);
}

export async function getTablesByBusinessAction(businessId: string) {
  return await getTablesByBusiness(businessId);
}

export async function addTableAction(branchId: string, data: { number: string; capacity: number }, quantity: number) {
  try {
    for (let i = 0; i < quantity; i++) {
        await createTable(branchId, data);
    }
    revalidatePath("/tables");
    return { success: "Tables added successfully" };
  } catch (error) {
    return { error: "Failed to add tables" };
  }
}

export async function deleteTableAction(id: string) {
    await deleteTable(id);
    revalidatePath("/tables");
    return { success: "Table deleted" };
}

export async function deleteTablesAction(ids: string[]) {
    for (const id of ids) {
        await deleteTable(id);
    }
    revalidatePath("/tables");
    return { success: "Tables deleted" };
}

export async function updateTablePositionAction(id: string, position: { x: number; y: number }) {
    await prisma.table.update({
        where: { id },
        data: { positionX: position.x, positionY: position.y }
    });
    revalidatePath("/tables");
    return { success: "Position updated" };
}
