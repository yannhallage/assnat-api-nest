import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🟢 Début du seed des types de congé');

    // -----------------------------
    // Création des Types de Congé
    // -----------------------------
    const typesConge = [
        'Congé maternité',
        'Congé pour enfant malade',
        'Congé annuel',
        'Congé parental à temps plein',
        'Congé maladie',
        'congé d\'examen',
    ];

    for (const libelle of typesConge) {
        await prisma.typeConge.create({
            data: {
                libelle_typeconge: libelle,
            },
        });
    }

    console.log(`✅ ${typesConge.length} types de congé créés avec succès`);
}

main()
    .catch((e) => {
        console.error('❌ Erreur lors du seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

