import { PrismaClient, RolePersonnel, TypePersonnel } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🟢 Début du seed minimal');

    // -----------------------------
    // Création de la Direction
    // -----------------------------
    const directionRH = await prisma.direction.create({
        data: {
            code_direction: 'DIR-RH',
            nom_direction: 'Direction des Ressources Humaines',
            nom_directeur: 'Alice Dupont',
            email_direction: 'rh@entreprise.com',
        },
    });

    // -----------------------------
    // Création du Service associé
    // -----------------------------
    const serviceRH = await prisma.service.create({
        data: {
            code_service: 'SRH-GEN',
            nom_service: 'Service Général RH',
            id_direction: directionRH.id_direction,
        },
    });

    // -----------------------------
    // Création de l'admin
    // -----------------------------
    const passwordHash = await bcrypt.hash('Admin@1234', 10); // mot de passe prédéfini

    await prisma.personnel.create({
        data: {
            nom_personnel: 'Admin',
            prenom_personnel: 'RH',
            email_personnel: 'admin@entreprise.com',
            email_travail: 'admin.rh@entreprise.com',
            password: passwordHash,
            role_personnel: RolePersonnel.ADMIN,
            type_personnel: TypePersonnel.PERMANENT,
            id_service: serviceRH.id_service,
        },
    });

    console.log('✅ Seed minimal terminé : admin prêt à se connecter');
}

main()
    .catch((e) => {
        console.error('❌ Erreur lors du seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
