-- CreateTable
CREATE TABLE "address" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "zip_code" INTEGER NOT NULL,
    "street" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "complement" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "is_main" BOOLEAN NOT NULL,

    CONSTRAINT "address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "is_main" BOOLEAN NOT NULL,
    "email_verified" BOOLEAN,

    CONSTRAINT "email_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "path" (
    "id" SERIAL NOT NULL,
    "path" TEXT NOT NULL,

    CONSTRAINT "path_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "is_admin" BOOLEAN NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rule" (
    "id" SERIAL NOT NULL,
    "role_id" INTEGER NOT NULL,
    "path_id" INTEGER NOT NULL,
    "create" BOOLEAN NOT NULL,
    "read" BOOLEAN NOT NULL,
    "update" BOOLEAN NOT NULL,
    "delete" BOOLEAN NOT NULL,

    CONSTRAINT "rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telephone" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "country_code" INTEGER NOT NULL,
    "state_code" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "is_main" BOOLEAN NOT NULL,

    CONSTRAINT "telephone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "nickname" TEXT,
    "birth_date" TIMESTAMP(3),
    "picture" TEXT,
    "updated_at" TIMESTAMP(3),
    "sub" TEXT NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_role" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,

    CONSTRAINT "user_role_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_sub_key" ON "user"("sub");

-- AddForeignKey
ALTER TABLE "address" ADD CONSTRAINT "address_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email" ADD CONSTRAINT "email_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rule" ADD CONSTRAINT "rule_path_id_fkey" FOREIGN KEY ("path_id") REFERENCES "path"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rule" ADD CONSTRAINT "rule_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telephone" ADD CONSTRAINT "telephone_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
