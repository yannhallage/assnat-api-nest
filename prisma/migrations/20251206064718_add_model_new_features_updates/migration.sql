/*
  Warnings:

  - Changed the type of `type_document` on the `personnel_documents` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TypeDocument" AS ENUM ('CNI', 'CONTRAT', 'DIPLOME', 'ATTestation');

-- AlterTable
ALTER TABLE "personnel_documents" DROP COLUMN "type_document",
ADD COLUMN     "type_document" "TypeDocument" NOT NULL;
