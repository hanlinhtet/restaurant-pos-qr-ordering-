"use server";

import prisma from "@/lib/prisma";

export async function getSauces(businessId: string) {
    const sauces = await prisma.sauce.findMany({ where: { businessId } });
    return sauces.map(s => ({ ...s, price: Number(s.price) }));
}
