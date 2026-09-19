import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getProducts } from "@/modules/products/actions/product";
import { getCategories } from "@/modules/categories/actions/category";
import { ProductListClient } from "@/modules/products/components/ProductListClient";

export default async function ProductsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const businessUser = await prisma.businessUser.findFirst({
    where: { userId: session.user.id }
  });
  
  if (!businessUser) redirect("/onboarding");

  const [products, categories] = await Promise.all([
    getProducts(businessUser.businessId),
    getCategories(businessUser.businessId)
  ]);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Products</h2>
        <p className="text-muted-foreground mt-2">Manage your menu items. Total products: {products.length}</p>
      </div>
      <ProductListClient 
        products={products} 
        categories={categories} 
        userRole={session?.user?.role}
      />
    </div>
  );
}
