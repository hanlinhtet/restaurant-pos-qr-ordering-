/*
  Warnings:

  - You are about to drop the `ProductSauce` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Sauce` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProductSauce" DROP CONSTRAINT "ProductSauce_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProductSauce" DROP CONSTRAINT "ProductSauce_sauceId_fkey";

-- DropForeignKey
ALTER TABLE "Sauce" DROP CONSTRAINT "Sauce_businessId_fkey";

-- DropTable
DROP TABLE "ProductSauce";

-- DropTable
DROP TABLE "Sauce";

-- CreateTable
CREATE TABLE "_ProductFlavours" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProductFlavours_AB_unique" ON "_ProductFlavours"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductFlavours_B_index" ON "_ProductFlavours"("B");

-- AddForeignKey
ALTER TABLE "_ProductFlavours" ADD CONSTRAINT "_ProductFlavours_A_fkey" FOREIGN KEY ("A") REFERENCES "InventoryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductFlavours" ADD CONSTRAINT "_ProductFlavours_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
