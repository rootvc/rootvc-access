/*
  Warnings:

  - You are about to drop the column `personNameFullName` on the `ClearbitEnrichment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ClearbitEnrichment" DROP COLUMN "personNameFullName",
ADD COLUMN     "personNameFamilyName" TEXT,
ADD COLUMN     "personNameGivenName" TEXT;
