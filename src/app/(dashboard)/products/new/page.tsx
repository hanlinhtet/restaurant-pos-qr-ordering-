import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getCategories } from "@/modules/categories/actions/category";
import { ProductForm } from "@/modules/products/components/ProductForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function NewProductPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const businessUser = await prisma.businessUser.findFirst({
    where: { userId: session.user.id },
    include: { business: { include: { branches: true } } }
  });
  
  if (!businessUser) redirect("/onboarding");

  const branchId = businessUser.business.branches[0]?.id || "";
  const categories = await getCategories(businessUser.businessId);

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Add New Product</h2>
        <Button variant="outline" asChild>
          <Link href="/products">Cancel</Link>
        </Button>
      </div>

      <div className="p-6 bg-white border rounded-2xl shadow-sm">
        <ProductForm 
          businessId={businessUser.businessId} 
          branchId={branchId}
          categories={categories} 
        />
      </div>
    </div>
  );
}
