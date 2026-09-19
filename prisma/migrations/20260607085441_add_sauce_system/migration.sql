-- CreateTable
CREATE TABLE "Sauce" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "businessId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sauce_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductSauce" (
    "productId" TEXT NOT NULL,
    "sauceId" TEXT NOT NULL,

    CONSTRAINT "ProductSauce_pkey" PRIMARY KEY ("productId","sauceId")
);

-- CreateIndex
CREATE INDEX "Sauce_businessId_idx" ON "Sauce"("businessId");

-- CreateIndex
CREATE INDEX "ProductSauce_productId_idx" ON "ProductSauce"("productId");

-- CreateIndex
CREATE INDEX "ProductSauce_sauceId_idx" ON "ProductSauce"("sauceId");

-- AddForeignKey
ALTER TABLE "Sauce" ADD CONSTRAINT "Sauce_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSauce" ADD CONSTRAINT "ProductSauce_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSauce" ADD CONSTRAINT "ProductSauce_sauceId_fkey" FOREIGN KEY ("sauceId") REFERENCES "Sauce"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
