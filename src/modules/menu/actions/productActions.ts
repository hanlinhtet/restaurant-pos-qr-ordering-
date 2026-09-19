"use server";

import { getProductDetail } from "../services/productService";

export async function getProductDetailAction(id: string) {
  return await getProductDetail(id);
}
