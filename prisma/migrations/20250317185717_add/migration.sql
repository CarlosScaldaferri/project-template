/*
  Warnings:

  - Added the required column `Country` to the `address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `District` to the `address` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "address" ADD COLUMN     "Country" TEXT NOT NULL,
ADD COLUMN     "District" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "cpf" TEXT;
