/*
  Warnings:

  - A unique constraint covering the columns `[superTokensId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "owner" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "superTokensId" TEXT NOT NULL DEFAULT E'placeholder';

-- CreateIndex
CREATE UNIQUE INDEX "User_superTokensId_key" ON "User"("superTokensId");
