/*
  Warnings:

  - The `email_verified` column on the `email` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `password` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "email" DROP COLUMN "email_verified",
ADD COLUMN     "email_verified" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "password" TEXT NOT NULL;
