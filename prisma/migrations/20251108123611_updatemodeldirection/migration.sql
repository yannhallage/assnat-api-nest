/*
  Warnings:

  - You are about to drop the column `nb_personnel` on the `directions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "directions" DROP COLUMN "nb_personnel",
ADD COLUMN     "business_email" TEXT,
ADD COLUMN     "business_phone" TEXT,
ADD COLUMN     "directeur_email" TEXT,
ADD COLUMN     "directeur_phone" TEXT,
ADD COLUMN     "motif_creation" TEXT,
ADD COLUMN     "nombre_bureau" TEXT,
ADD COLUMN     "nombre_service" TEXT,
ADD COLUMN     "numero_direction" TEXT;
