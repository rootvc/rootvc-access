/*
  Warnings:

  - A unique constraint covering the columns `[messageId]` on the table `Message` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `messageId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "messageId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Message_messageId_key" ON "Message"("messageId");
