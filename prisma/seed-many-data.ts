import { PrismaClient, TypeContrat, StatutPersonnel, RolePersonnel, TypePersonnel, TypeDocument } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// IDs de services existants
const SERVICE_IDS = [
  'c45f3fda-d86f-47f2-a0b8-7de68c691ff5',
  'ece3c05f-7ca0-473a-8c85-8aaecff42935',
];

// Données de base pour générer 20 personnels
const PRENOMS = [
  'Jean', 'Marie', 'Pierre', 'Sophie', 'Paul', 'Julie', 'Marc', 'Camille',
  'Thomas', 'Emma', 'Lucas', 'Léa', 'Antoine', 'Chloé', 'Nicolas', 'Sarah',
  'Alexandre', 'Laura', 'David', 'Manon'
];

const NOMS = [
  'Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit',
  'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel',
  'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier'
];

const POSTES = [
  'Développeur', 'Analyste', 'Chef de projet', 'Designer', 'Consultant',
  'Ingénieur', 'Architecte', 'Manager', 'Assistant', 'Coordinateur',
  'Spécialiste', 'Expert', 'Technicien', 'Superviseur', 'Responsable'
];

const BANQUES = [
  'SGBC', 'UBA', 'Afriland First Bank', 'Crédit Lyonnais', 'BGFI',
  'Standard Chartered', 'Ecobank', 'Société Générale'
];

const VILLES = [
  'Yaoundé', 'Douala', 'Bafoussam', 'Garoua', 'Maroua', 'Buea', 'Limbe', 'Bamenda'
];

async function main() {
  console.log('🟢 Début du seed pour 20 personnels avec contrats, paies et documents');

  // Vérifier que les services existent
  const services = await prisma.service.findMany({
    where: {
      id_service: { in: SERVICE_IDS },
    },
    include: {
      direction: true,
    },
  });

  if (services.length !== 2) {
    console.error('❌ Erreur: Les services spécifiés ne sont pas tous trouvés');
    console.error(`   Services trouvés: ${services.length}/2`);
    return;
  }

  console.log(`✅ ${services.length} services trouvés`);
  services.forEach(service => {
    console.log(`   - ${service.nom_service} (Direction: ${service.direction.nom_direction})`);
  });

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // Générer 20 personnels
  for (let i = 0; i < 20; i++) {
    const prenom = PRENOMS[i];
    const nom = NOMS[i];
    const email = `${prenom.toLowerCase()}.${nom.toLowerCase()}${i}@entreprise.com`;
    const emailTravail = `${prenom.toLowerCase()}.${nom.toLowerCase()}${i}.travail@entreprise.com`;
    const matricule = `MAT-${String(i + 1).padStart(4, '0')}`;
    const serviceIndex = i % 2; // Alterner entre les deux services
    const service = services[serviceIndex];
    
    // Date de naissance aléatoire (entre 25 et 55 ans)
    const age = 25 + Math.floor(Math.random() * 30);
    const dateNaissance = new Date();
    dateNaissance.setFullYear(dateNaissance.getFullYear() - age);
    dateNaissance.setMonth(Math.floor(Math.random() * 12));
    dateNaissance.setDate(Math.floor(Math.random() * 28) + 1);

    // Date d'embauche (entre 1 et 5 ans)
    const dateEmbauche = new Date();
    dateEmbauche.setFullYear(dateEmbauche.getFullYear() - (1 + Math.floor(Math.random() * 5)));
    dateEmbauche.setMonth(Math.floor(Math.random() * 12));
    dateEmbauche.setDate(Math.floor(Math.random() * 28) + 1);

    // Salaire de base (entre 200 000 et 1 500 000)
    const salaireBase = 200000 + Math.floor(Math.random() * 1300000);

    // Type de contrat aléatoire
    const typesContrat: TypeContrat[] = [TypeContrat.CDI, TypeContrat.CDD, TypeContrat.CONSULTANT];
    const typeContrat = typesContrat[Math.floor(Math.random() * typesContrat.length)];

    // Date de fin de contrat (seulement pour CDD)
    let dateFinContrat: Date | null = null;
    if (typeContrat === TypeContrat.CDD) {
      dateFinContrat = new Date(dateEmbauche);
      dateFinContrat.setFullYear(dateFinContrat.getFullYear() + 1);
    }

    // Créer le personnel
    const personnel = await prisma.personnel.create({
      data: {
        nom_personnel: nom,
        prenom_personnel: prenom,
        email_personnel: email,
        email_travail: emailTravail,
        password: passwordHash,
        date_naissance: dateNaissance,
        matricule_personnel: matricule,
        telephone_travail: `+237 6${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}`,
        telephone_personnel: `+237 6${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}`,
        ville_personnel: VILLES[Math.floor(Math.random() * VILLES.length)],
        adresse_personnel: `${Math.floor(Math.random() * 200) + 1} Rue ${nom}`,
        codepostal: String(Math.floor(Math.random() * 90000) + 10000),
        pays_personnel: 'Cameroun',
        telephone_contact_urgence: `+237 6${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}`,
        nom_contact_urgence: `Contact ${nom}`,
        poste: POSTES[Math.floor(Math.random() * POSTES.length)],
        type_contrat: typeContrat,
        date_embauche: dateEmbauche,
        date_fin_contrat: dateFinContrat,
        salaire_base: salaireBase,
        niveau_hierarchique: ['Junior', 'Sénior', 'Expert'][Math.floor(Math.random() * 3)],
        numero_cnps: `CNPS-${Math.floor(Math.random() * 900000) + 100000}`,
        banque_nom: BANQUES[Math.floor(Math.random() * BANQUES.length)],
        banque_rib: `${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        statut_professionnel: StatutPersonnel.ACTIF,
        role_personnel: RolePersonnel.EMPLOYE,
        type_personnel: TypePersonnel.PERMANENT,
        id_service: service.id_service,
        is_active: true,
        disponibilité_day: 45,
      },
    });

    console.log(`✅ Personnel ${i + 1}/20 créé: ${prenom} ${nom} (${personnel.id_personnel})`);

    // Créer un contrat (sans url_contrat)
    const contrat = await prisma.contrat.create({
      data: {
        type_contrat: typeContrat,
        date_debut: dateEmbauche,
        date_fin: dateFinContrat,
        salaire_reference: salaireBase,
        statut: 'Actif',
        id_personnel: personnel.id_personnel,
      },
    });

    console.log(`   ✅ Contrat créé: ${contrat.id_contrat}`);

    // Créer 3 paies (pour les 3 derniers mois)
    const maintenant = new Date();
    for (let moisOffset = 0; moisOffset < 3; moisOffset++) {
      const datePaie = new Date(maintenant);
      datePaie.setMonth(datePaie.getMonth() - moisOffset);
      
      const mois = datePaie.getMonth() + 1;
      const annee = datePaie.getFullYear();
      
      // Calculer salaire brut et net
      const primes = Math.floor(Math.random() * 50000);
      const deductions = Math.floor(Math.random() * 30000);
      const salaireBrut = salaireBase + primes;
      const salaireNet = salaireBrut - deductions;

      const paie = await prisma.paie.create({
        data: {
          mois: mois,
          annee: annee,
          salaire_brut: salaireBrut,
          salaire_net: salaireNet,
          primes: primes,
          deductions: deductions,
          id_personnel: personnel.id_personnel,
        },
      });

      console.log(`   ✅ Paie créée: ${mois}/${annee} (${paie.id_paie})`);
    }

    // Créer 2-3 documents par personnel
    const typesDocuments: TypeDocument[] = [TypeDocument.CNI, TypeDocument.CONTRAT, TypeDocument.DIPLOME, TypeDocument.ATTestation];
    const nbDocuments = 2 + Math.floor(Math.random() * 2); // 2 ou 3 documents

    for (let j = 0; j < nbDocuments; j++) {
      const typeDoc = typesDocuments[Math.floor(Math.random() * typesDocuments.length)];
      const urlDocument = `https://example.com/documents/${personnel.id_personnel}/${typeDoc.toLowerCase()}-${j + 1}.pdf`;

      const document = await prisma.personnelDocument.create({
        data: {
          type_document: typeDoc,
          url_document: urlDocument,
          id_personnel: personnel.id_personnel,
        },
      });

      console.log(`   ✅ Document créé: ${typeDoc} (${document.id_document})`);
    }
  }

  console.log('✅ Seed terminé : 20 personnels créés avec leurs contrats, paies et documents');
  console.log('   - 20 personnels');
  console.log('   - 20 contrats');
  console.log('   - 60 paies (3 par personnel)');
  console.log('   - ~50 documents (2-3 par personnel)');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

