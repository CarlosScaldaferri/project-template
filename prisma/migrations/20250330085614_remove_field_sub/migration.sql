/*
  Warnings:

  - You are about to drop the column `sub` on the `user` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "user_sub_key";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "sub";
