/*
  Warnings:

  - A unique constraint covering the columns `[clearbitId]` on the table `Company` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[clearbitId]` on the table `Person` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clearbitId` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clearbitId` to the `Person` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "clearbitId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Person" ADD COLUMN     "clearbitId" TEXT NOT NULL,
ALTER COLUMN "companyId" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Company_clearbitId_key" ON "Company"("clearbitId");

-- CreateIndex
CREATE UNIQUE INDEX "Person_clearbitId_key" ON "Person"("clearbitId");
