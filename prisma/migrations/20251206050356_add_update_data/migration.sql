-- CreateEnum
CREATE TYPE "TypeContrat" AS ENUM ('CDI', 'CDD', 'STAGE', 'CONSULTANT');

-- CreateEnum
CREATE TYPE "StatutPersonnel" AS ENUM ('ACTIF', 'SUSPENDU', 'EN_CONGE', 'DEMISSIONNE', 'LICENCIE');

-- AlterEnum
ALTER TYPE "RolePersonnel" ADD VALUE 'COMPTA_ADMIN';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TypePersonnel" ADD VALUE 'CONSULTANT';
ALTER TYPE "TypePersonnel" ADD VALUE 'TEMPORAIRE';
