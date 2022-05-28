-- AlterTable
ALTER TABLE "User" ALTER COLUMN "googleAccessToken" DROP NOT NULL,
ALTER COLUMN "isOwner" SET DEFAULT false;
