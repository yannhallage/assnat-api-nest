-- AlterTable
ALTER TABLE "personnels" ADD COLUMN     "banque_nom" TEXT,
ADD COLUMN     "banque_rib" TEXT,
ADD COLUMN     "date_embauche" TIMESTAMP(3),
ADD COLUMN     "date_fin_contrat" TIMESTAMP(3),
ADD COLUMN     "niveau_hierarchique" TEXT,
ADD COLUMN     "numero_cnps" TEXT,
ADD COLUMN     "poste" TEXT,
ADD COLUMN     "salaire_base" DOUBLE PRECISION,
ADD COLUMN     "statut_professionnel" "StatutPersonnel" NOT NULL DEFAULT 'ACTIF',
ADD COLUMN     "type_contrat" "TypeContrat" NOT NULL DEFAULT 'CDI';

-- CreateTable
CREATE TABLE "contrats" (
    "id_contrat" TEXT NOT NULL,
    "type_contrat" "TypeContrat" NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3),
    "salaire_reference" DOUBLE PRECISION,
    "url_contrat" TEXT,
    "statut" TEXT,
    "id_personnel" TEXT NOT NULL,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contrats_pkey" PRIMARY KEY ("id_contrat")
);

-- CreateTable
CREATE TABLE "paies" (
    "id_paie" TEXT NOT NULL,
    "mois" INTEGER NOT NULL,
    "annee" INTEGER NOT NULL,
    "salaire_net" DOUBLE PRECISION NOT NULL,
    "salaire_brut" DOUBLE PRECISION NOT NULL,
    "primes" DOUBLE PRECISION,
    "deductions" DOUBLE PRECISION,
    "url_bulletin" TEXT,
    "id_personnel" TEXT NOT NULL,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "paies_pkey" PRIMARY KEY ("id_paie")
);

-- CreateTable
CREATE TABLE "personnel_documents" (
    "id_document" TEXT NOT NULL,
    "type_document" TEXT NOT NULL,
    "url_document" TEXT NOT NULL,
    "date_ajout" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_personnel" TEXT NOT NULL,

    CONSTRAINT "personnel_documents_pkey" PRIMARY KEY ("id_document")
);

-- AddForeignKey
ALTER TABLE "contrats" ADD CONSTRAINT "contrats_id_personnel_fkey" FOREIGN KEY ("id_personnel") REFERENCES "personnels"("id_personnel") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paies" ADD CONSTRAINT "paies_id_personnel_fkey" FOREIGN KEY ("id_personnel") REFERENCES "personnels"("id_personnel") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personnel_documents" ADD CONSTRAINT "personnel_documents_id_personnel_fkey" FOREIGN KEY ("id_personnel") REFERENCES "personnels"("id_personnel") ON DELETE RESTRICT ON UPDATE CASCADE;
