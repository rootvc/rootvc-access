-- CreateTable
CREATE TABLE "Connection" (
    "id" SERIAL NOT NULL,
    "owner" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "toOwner" INTEGER NOT NULL,
    "fromOwner" INTEGER NOT NULL,
    "toAndFromOwner" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Connection_pkey" PRIMARY KEY ("id")
);
