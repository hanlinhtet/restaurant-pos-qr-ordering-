import { protectPage } from "@/modules/auth/utils/rbac";
import { UserRole } from "@prisma/client";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getCategories } from "@/modules/categories/actions/category";
import CategoriesPage from "./view";

export default async function CategoriesContainer() {
  const session = await protectPage([UserRole.OWNER, UserRole.MANAGER, UserRole.KITCHEN]);

  const businessUser = await prisma.businessUser.findFirst({
    where: { userId: session.user.id }
  });
  
  if (!businessUser) redirect("/onboarding");

  const categories = await getCategories(businessUser.businessId);

  return <CategoriesPage categories={categories} businessId={businessUser.businessId} />;
}
