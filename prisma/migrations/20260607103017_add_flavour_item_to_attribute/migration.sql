-- AlterTable
ALTER TABLE "ProductAttribute" ADD COLUMN     "flavourItemId" TEXT;

-- CreateIndex
CREATE INDEX "ProductAttribute_flavourItemId_idx" ON "ProductAttribute"("flavourItemId");

-- AddForeignKey
ALTER TABLE "ProductAttribute" ADD CONSTRAINT "ProductAttribute_flavourItemId_fkey" FOREIGN KEY ("flavourItemId") REFERENCES "InventoryItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
