-- CreateTable
CREATE TABLE "notifications" (
    "id_notification" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_lu" BOOLEAN NOT NULL DEFAULT false,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_personnel" TEXT NOT NULL,
    "id_demande" TEXT,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id_notification")
);

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_id_personnel_fkey" FOREIGN KEY ("id_personnel") REFERENCES "personnels"("id_personnel") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_id_demande_fkey" FOREIGN KEY ("id_demande") REFERENCES "demandes"("id_demande") ON DELETE SET NULL ON UPDATE CASCADE;
