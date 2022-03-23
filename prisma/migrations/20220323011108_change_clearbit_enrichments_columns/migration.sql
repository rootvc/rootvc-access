/*
  Warnings:

  - You are about to drop the column `personNameFamilyName` on the `ClearbitEnrichment` table. All the data in the column will be lost.
  - You are about to drop the column `personNameGivenName` on the `ClearbitEnrichment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ClearbitEnrichment" DROP COLUMN "personNameFamilyName",
DROP COLUMN "personNameGivenName",
ALTER COLUMN "personId" SET DATA TYPE TEXT,
ALTER COLUMN "companyId" SET DATA TYPE TEXT;
