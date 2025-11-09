/*
  Warnings:

  - You are about to drop the column `business_email` on the `directions` table. All the data in the column will be lost.
  - You are about to drop the column `business_phone` on the `directions` table. All the data in the column will be lost.
  - You are about to drop the column `directeur_email` on the `directions` table. All the data in the column will be lost.
  - You are about to drop the column `directeur_phone` on the `directions` table. All the data in the column will be lost.
  - You are about to drop the column `motif_creation` on the `directions` table. All the data in the column will be lost.
  - You are about to drop the column `nombre_bureau` on the `directions` table. All the data in the column will be lost.
  - You are about to drop the column `nombre_service` on the `directions` table. All the data in the column will be lost.
  - You are about to drop the column `numero_direction` on the `directions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "directions" DROP COLUMN "business_email",
DROP COLUMN "business_phone",
DROP COLUMN "directeur_email",
DROP COLUMN "directeur_phone",
DROP COLUMN "motif_creation",
DROP COLUMN "nombre_bureau",
DROP COLUMN "nombre_service",
DROP COLUMN "numero_direction",
ADD COLUMN     "nb_personnel" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "id_chefdeservice" TEXT DEFAULT 'a definir';
