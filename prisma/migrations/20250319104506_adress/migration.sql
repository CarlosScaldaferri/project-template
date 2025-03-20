/*
  Warnings:

  - You are about to drop the column `Country` on the `address` table. All the data in the column will be lost.
  - You are about to drop the column `District` on the `address` table. All the data in the column will be lost.
  - Added the required column `country` to the `address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `district` to the `address` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "address" DROP COLUMN "Country",
DROP COLUMN "District",
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "district" TEXT NOT NULL;
