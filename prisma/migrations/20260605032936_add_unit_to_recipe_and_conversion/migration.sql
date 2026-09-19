/*
  Warnings:

  - Added the required column `unit` to the `RecipeItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RecipeItem" ADD COLUMN "unit" "UnitOfMeasure";

-- Update existing rows
UPDATE "RecipeItem" SET "unit" = 'GRAM';

-- Set NOT NULL
ALTER TABLE "RecipeItem" ALTER COLUMN "unit" SET NOT NULL;

-- CreateTable
CREATE TABLE "UnitConversion" (
    "id" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "unit" "UnitOfMeasure" NOT NULL,
    "factor" DECIMAL(12,6) NOT NULL,

    CONSTRAINT "UnitConversion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UnitConversion_inventoryItemId_idx" ON "UnitConversion"("inventoryItemId");

-- AddForeignKey
ALTER TABLE "UnitConversion" ADD CONSTRAINT "UnitConversion_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
