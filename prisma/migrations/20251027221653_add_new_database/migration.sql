-- CreateEnum
CREATE TYPE "StatutDemande" AS ENUM ('EN_ATTENTE', 'APPROUVEE', 'REFUSEE');

-- CreateEnum
CREATE TYPE "RolePersonnel" AS ENUM ('ADMIN', 'RH', 'CHEF_SERVICE', 'EMPLOYE');

-- CreateEnum
CREATE TYPE "TypePersonnel" AS ENUM ('PERMANENT', 'CONTRACTUEL', 'STAGIAIRE');

-- CreateTable
CREATE TABLE "directions" (
    "id_direction" TEXT NOT NULL,
    "code_direction" TEXT NOT NULL,
    "nom_direction" TEXT NOT NULL,
    "nb_personnel" INTEGER DEFAULT 0,
    "nom_directeur" TEXT NOT NULL,
    "email_direction" TEXT,
    "statut" TEXT DEFAULT 'ACTIF',
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "directions_pkey" PRIMARY KEY ("id_direction")
);

-- CreateTable
CREATE TABLE "services" (
    "id_service" TEXT NOT NULL,
    "code_service" TEXT NOT NULL,
    "nom_service" TEXT NOT NULL,
    "nb_personnel" INTEGER DEFAULT 0,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_direction" TEXT NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id_service")
);

-- CreateTable
CREATE TABLE "personnels" (
    "id_personnel" TEXT NOT NULL,
    "nom_personnel" TEXT NOT NULL,
    "prenom_personnel" TEXT NOT NULL,
    "email_personnel" TEXT,
    "email_travail" TEXT,
    "password" TEXT,
    "date_naissance" TIMESTAMP(3),
    "matricule_personnel" TEXT,
    "telephone_travail" TEXT,
    "telephone_personnel" TEXT,
    "ville_personnel" TEXT,
    "adresse_personnel" TEXT,
    "codepostal" TEXT,
    "pays_personnel" TEXT,
    "telephone_contact_urgence" TEXT,
    "nom_contact_urgence" TEXT,
    "role_personnel" "RolePersonnel" NOT NULL DEFAULT 'EMPLOYE',
    "type_personnel" "TypePersonnel" NOT NULL DEFAULT 'PERMANENT',
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_service" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "personnels_pkey" PRIMARY KEY ("id_personnel")
);

-- CreateTable
CREATE TABLE "types_conge" (
    "id_typeconge" TEXT NOT NULL,
    "libelle_typeconge" TEXT NOT NULL,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "types_conge_pkey" PRIMARY KEY ("id_typeconge")
);

-- CreateTable
CREATE TABLE "periodes_conge" (
    "id_periodeconge" TEXT NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3) NOT NULL,
    "nb_jour" INTEGER NOT NULL,
    "id_typeconge" TEXT NOT NULL,

    CONSTRAINT "periodes_conge_pkey" PRIMARY KEY ("id_periodeconge")
);

-- CreateTable
CREATE TABLE "demandes" (
    "id_demande" TEXT NOT NULL,
    "type_demande" TEXT NOT NULL,
    "statut_demande" "StatutDemande" NOT NULL DEFAULT 'EN_ATTENTE',
    "date_demande" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "motif" TEXT,
    "id_personnel" TEXT NOT NULL,
    "id_service" TEXT,
    "id_periodeconge" TEXT,
    "id_chef_service" TEXT,

    CONSTRAINT "demandes_pkey" PRIMARY KEY ("id_demande")
);

-- CreateTable
CREATE TABLE "discussions" (
    "id_discussion" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "date_message" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "heure_message" TEXT,
    "id_demande" TEXT NOT NULL,

    CONSTRAINT "discussions_pkey" PRIMARY KEY ("id_discussion")
);

-- CreateTable
CREATE TABLE "fiches_conge" (
    "id_ficheconge" TEXT NOT NULL,
    "message" TEXT,
    "date_message" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "heure_message" TEXT,
    "id_demande" TEXT NOT NULL,
    "id_personnel" TEXT NOT NULL,

    CONSTRAINT "fiches_conge_pkey" PRIMARY KEY ("id_ficheconge")
);

-- CreateIndex
CREATE UNIQUE INDEX "directions_code_direction_key" ON "directions"("code_direction");

-- CreateIndex
CREATE UNIQUE INDEX "services_code_service_key" ON "services"("code_service");

-- CreateIndex
CREATE UNIQUE INDEX "personnels_email_personnel_key" ON "personnels"("email_personnel");

-- CreateIndex
CREATE UNIQUE INDEX "personnels_email_travail_key" ON "personnels"("email_travail");

-- CreateIndex
CREATE UNIQUE INDEX "personnels_matricule_personnel_key" ON "personnels"("matricule_personnel");

-- CreateIndex
CREATE UNIQUE INDEX "types_conge_libelle_typeconge_key" ON "types_conge"("libelle_typeconge");

-- CreateIndex
CREATE UNIQUE INDEX "fiches_conge_id_demande_key" ON "fiches_conge"("id_demande");

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_id_direction_fkey" FOREIGN KEY ("id_direction") REFERENCES "directions"("id_direction") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personnels" ADD CONSTRAINT "personnels_id_service_fkey" FOREIGN KEY ("id_service") REFERENCES "services"("id_service") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periodes_conge" ADD CONSTRAINT "periodes_conge_id_typeconge_fkey" FOREIGN KEY ("id_typeconge") REFERENCES "types_conge"("id_typeconge") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demandes" ADD CONSTRAINT "demandes_id_personnel_fkey" FOREIGN KEY ("id_personnel") REFERENCES "personnels"("id_personnel") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demandes" ADD CONSTRAINT "demandes_id_service_fkey" FOREIGN KEY ("id_service") REFERENCES "services"("id_service") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demandes" ADD CONSTRAINT "demandes_id_periodeconge_fkey" FOREIGN KEY ("id_periodeconge") REFERENCES "periodes_conge"("id_periodeconge") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demandes" ADD CONSTRAINT "demandes_id_chef_service_fkey" FOREIGN KEY ("id_chef_service") REFERENCES "personnels"("id_personnel") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussions" ADD CONSTRAINT "discussions_id_demande_fkey" FOREIGN KEY ("id_demande") REFERENCES "demandes"("id_demande") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fiches_conge" ADD CONSTRAINT "fiches_conge_id_demande_fkey" FOREIGN KEY ("id_demande") REFERENCES "demandes"("id_demande") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fiches_conge" ADD CONSTRAINT "fiches_conge_id_personnel_fkey" FOREIGN KEY ("id_personnel") REFERENCES "personnels"("id_personnel") ON DELETE RESTRICT ON UPDATE CASCADE;
