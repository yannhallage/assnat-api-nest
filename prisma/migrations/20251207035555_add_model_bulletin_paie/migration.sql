-- CreateTable
CREATE TABLE "bulletins_paie" (
    "id_bulletin" TEXT NOT NULL,
    "id_paie" TEXT NOT NULL,
    "url_pdf" TEXT NOT NULL,
    "date_emission" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note_rh" TEXT,

    CONSTRAINT "bulletins_paie_pkey" PRIMARY KEY ("id_bulletin")
);

-- AddForeignKey
ALTER TABLE "bulletins_paie" ADD CONSTRAINT "bulletins_paie_id_paie_fkey" FOREIGN KEY ("id_paie") REFERENCES "paies"("id_paie") ON DELETE RESTRICT ON UPDATE CASCADE;
