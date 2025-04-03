/*
  Warnings:

  - Added the required column `field` to the `path` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "path_route_key";

-- AlterTable
ALTER TABLE "path" ADD COLUMN     "field" TEXT NOT NULL;
