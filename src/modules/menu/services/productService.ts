import prisma from "@/lib/prisma";

export async function getProductDetail(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      variants: true,
      attributes: true,
      flavours: true
    }
  });

  if (!product) return null;

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price ? Number(product.price) : null,
    image: product.image,
    categoryId: product.categoryId,
    applyAttribute: product.applyAttribute,
    applyPortion: product.applyPortion,
    isAvailable: product.isAvailable,
    flavours: product.flavours.map(f => ({
        id: f.id,
        name: f.name,
        price: 0
    })),
    variants: product.variants.map(v => ({
      id: v.id,
      name: v.name,
      price: Number(v.price),
      portion: v.portion,
      flavour: v.flavour,
      productId: v.productId,
      isAvailable: v.isAvailable
    })),
    attributes: product.attributes.map(a => ({
        id: a.id,
        name: a.name,
        content: a.content,
        price: Number(a.price),
        disable: a.disable,
        productId: a.productId
    }))
  };
}
