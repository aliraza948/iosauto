/*
  Warnings:

  - The primary key for the `Contacts` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Contacts" DROP CONSTRAINT "Contacts_pkey",
ALTER COLUMN "id" SET DATA TYPE BIGINT,
ADD CONSTRAINT "Contacts_pkey" PRIMARY KEY ("id");
