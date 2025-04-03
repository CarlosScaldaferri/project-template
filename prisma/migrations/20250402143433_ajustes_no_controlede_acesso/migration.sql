/*
  Warnings:

  - You are about to drop the column `path` on the `path` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[route]` on the table `path` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `role` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cpf]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,role_id]` on the table `user_role` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `route` to the `path` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "rule" DROP CONSTRAINT "rule_role_id_fkey";

-- AlterTable
ALTER TABLE "path" DROP COLUMN "path",
ADD COLUMN     "route" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "role" ALTER COLUMN "is_admin" SET DEFAULT false;

-- AlterTable
ALTER TABLE "rule" ADD COLUMN     "user_id" INTEGER,
ALTER COLUMN "role_id" DROP NOT NULL,
ALTER COLUMN "create" SET DEFAULT false,
ALTER COLUMN "read" SET DEFAULT false,
ALTER COLUMN "update" SET DEFAULT false,
ALTER COLUMN "delete" SET DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "path_route_key" ON "path"("route");

-- CreateIndex
CREATE UNIQUE INDEX "role_name_key" ON "role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_cpf_key" ON "user"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "user_role_user_id_role_id_key" ON "user_role"("user_id", "role_id");

-- AddForeignKey
ALTER TABLE "rule" ADD CONSTRAINT "rule_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rule" ADD CONSTRAINT "rule_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
