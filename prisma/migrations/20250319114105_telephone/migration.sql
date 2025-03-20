/*
  Warnings:

  - Added the required column `full_number` to the `telephone` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "telephone" ADD COLUMN     "full_number" TEXT NOT NULL;
