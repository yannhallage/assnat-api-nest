import { PrismaClient, RolePersonnel, TypePersonnel } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🟢 Début du seed pour l\'administrateur comptable');

    // -----------------------------
    // Vérification/Création de la Direction Comptabilité
    // -----------------------------
    let directionCompta = await prisma.direction.findFirst({
        where: {
            code_direction: 'DIR-COMPTA',
        },
    });

    if (!directionCompta) {
        directionCompta = await prisma.direction.create({
            data: {
                code_direction: 'DIR-COMPTA',
                nom_direction: 'Direction de la Comptabilité',
                nom_directeur: 'Directeur Comptabilité',
                email_direction: 'comptabilite@entreprise.com',
            },
        });
        console.log('✅ Direction Comptabilité créée');
    } else {
        console.log('ℹ️  Direction Comptabilité existe déjà');
    }

    // -----------------------------
    // Vérification/Création du Service Comptabilité
    // -----------------------------
    let serviceCompta = await prisma.service.findFirst({
        where: {
            code_service: 'SCOMPTA-GEN',
        },
    });

    if (!serviceCompta) {
        serviceCompta = await prisma.service.create({
            data: {
                code_service: 'SCOMPTA-GEN',
                nom_service: 'Service Général Comptabilité',
                id_direction: directionCompta.id_direction,
            },
        });
        console.log('✅ Service Comptabilité créé');
    } else {
        console.log('ℹ️  Service Comptabilité existe déjà');
    }

    // -----------------------------
    // Vérification si l'admin comptable existe déjà
    // -----------------------------
    const existingComptaAdmin = await prisma.personnel.findFirst({
        where: {
            email_personnel: 'compta.admin@entreprise.com',
        },
    });

    if (existingComptaAdmin) {
        console.log('⚠️  L\'administrateur comptable existe déjà avec l\'email: compta.admin@entreprise.com');
        return;
    }

    // -----------------------------
    // Création de l'admin comptable
    // -----------------------------
    const passwordHash = await bcrypt.hash('ComptaAdmin@1234', 10); // mot de passe prédéfini

    const comptaAdmin = await prisma.personnel.create({
        data: {
            nom_personnel: 'Admin',
            prenom_personnel: 'Comptabilité',
            email_personnel: 'compta.admin@entreprise.com',
            email_travail: 'compta.admin.travail@entreprise.com',
            password: passwordHash,
            role_personnel: RolePersonnel.COMPTA_ADMIN,
            type_personnel: TypePersonnel.PERMANENT,
            id_service: serviceCompta.id_service,
            poste: 'Administrateur Comptabilité',
            is_active: true,
        },
    });

    console.log('✅ Administrateur comptable créé avec succès');
    console.log(`   - Email: ${comptaAdmin.email_personnel}`);
    console.log(`   - Mot de passe: ComptaAdmin@1234`);
    console.log(`   - ID: ${comptaAdmin.id_personnel}`);
    console.log('✅ Seed terminé : administrateur comptable prêt à se connecter');
}

main()
    .catch((e) => {
        console.error('❌ Erreur lors du seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

