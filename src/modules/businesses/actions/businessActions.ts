"use server";

import { getBusinessInfo } from "../services/businessService";

export async function getBusinessInfoAction(tableId: string) {
  return await getBusinessInfo(tableId);
}
