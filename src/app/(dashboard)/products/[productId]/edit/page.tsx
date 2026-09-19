import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { getCategories } from "@/modules/categories/actions/category";
import { ProductForm } from "@/modules/products/components/ProductForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function EditProductPage({ params }: { params: Promise<{ productId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const businessUser = await prisma.businessUser.findFirst({
    where: { userId: session.user.id },
    include: { business: { include: { branches: true } } }
  });
  
  if (!businessUser) redirect("/onboarding");
  const branchId = businessUser.business.branches[0]?.id || "";

  const { productId } = await params;

  const productData = await prisma.product.findFirst({
    where: { id: productId, businessId: businessUser.businessId },
    include: { variants: true, attributes: true, flavours: true }
  });

  if (!productData) notFound();

  const product = {
    ...productData,
    price: productData.price ? Number(productData.price) : null,
    variants: productData.variants.map(v => ({
      ...v,
      price: Number(v.price)
    })),
    attributes: productData.attributes.map(a => ({
      ...a,
      price: Number(a.price)
    })),
    flavours: productData.flavours.map(f => ({
        ...f,
        stockAmount: Number(f.stockAmount),
        minStockLevel: f.minStockLevel ? Number(f.minStockLevel) : null,
        costPerUnit: f.costPerUnit ? Number(f.costPerUnit) : null
    }))
  };

  const categories = await getCategories(businessUser.businessId);

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Edit Product</h2>
        <Button variant="outline" asChild>
          <Link href="/products">Cancel</Link>
        </Button>
      </div>

      <div className="p-6 bg-white border rounded-2xl shadow-sm">
        <ProductForm 
          businessId={businessUser.businessId} 
          branchId={branchId} 
          categories={categories}
          product={product}
        />
      </div>
    </div>
  );
}
