-- CreateTable
CREATE TABLE "ClearbitEnrichment" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "raw" JSONB,
    "personId" INTEGER,
    "personNameFamilyName" TEXT,
    "personNameGivenName" TEXT,
    "personNameFullName" TEXT,
    "personIndexedAt" TIMESTAMP(3),
    "companyId" INTEGER,
    "companyDomain" TEXT,
    "companyName" TEXT,
    "companyIndexedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClearbitEnrichment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClearbitEnrichment_email_key" ON "ClearbitEnrichment"("email");
