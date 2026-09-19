"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { getAnalyticsData } from "../services/analyticsService";

export async function getAnalyticsAction(days: number = 30) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const businessUser = await prisma.businessUser.findFirst({
        where: { userId: session.user.id }
    });

    if (!businessUser) throw new Error("No business found");

    return await getAnalyticsData(businessUser.businessId, days);
}
