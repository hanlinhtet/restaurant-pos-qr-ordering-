-- CreateTable
CREATE TABLE "Flavour" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "Flavour_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Flavour_productId_idx" ON "Flavour"("productId");

-- AddForeignKey
ALTER TABLE "Flavour" ADD CONSTRAINT "Flavour_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
