"use server";

import { initializeTableSession, updateSessionActivity, createTableSession } from "../services/sessionService";

export async function initializeTableSessionAction(tableId: string) {
  return await initializeTableSession(tableId);
}

export async function createTableSessionAction(tableId: string) {
    return await createTableSession(tableId);
}

export async function updateSessionActivityAction(tableId: string) {
    return await updateSessionActivity(tableId);
}
