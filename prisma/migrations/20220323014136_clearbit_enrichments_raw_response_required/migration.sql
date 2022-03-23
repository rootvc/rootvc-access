/*
  Warnings:

  - Made the column `raw` on table `ClearbitEnrichment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ClearbitEnrichment" ALTER COLUMN "raw" SET NOT NULL;
