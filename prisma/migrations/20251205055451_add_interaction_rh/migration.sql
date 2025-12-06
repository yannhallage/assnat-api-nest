-- CreateTable
CREATE TABLE "interactions_rh" (
    "id_interaction_rh" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interactions_rh_pkey" PRIMARY KEY ("id_interaction_rh")
);
