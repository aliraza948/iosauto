-- CreateTable
CREATE TABLE "Contacts" (
    "id" INTEGER NOT NULL,
    "name" TEXT,
    "image" BYTEA NOT NULL,

    CONSTRAINT "Contacts_pkey" PRIMARY KEY ("id")
);
