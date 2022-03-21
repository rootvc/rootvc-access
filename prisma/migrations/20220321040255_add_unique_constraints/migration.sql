/*
  Warnings:

  - A unique constraint covering the columns `[domain]` on the table `Company` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[owner,contact]` on the table `Connection` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Person` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Company_domain_key" ON "Company"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "Connection_owner_contact_key" ON "Connection"("owner", "contact");

-- CreateIndex
CREATE UNIQUE INDEX "Person_email_key" ON "Person"("email");
