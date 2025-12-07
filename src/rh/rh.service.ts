import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../shared/prisma/prisma.service';
import { CreateDirectionDto, CreateInteractionRhDto, CreateContratDto, UpdateContratDto, CreatePaieDto, UpdatePaieDto, CreatePersonnelDocumentDto, UpdatePersonnelDocumentDto } from './dto/rh.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { CreatePersonnelDto } from './dto/create-personnel.dto';
import { CreateAlertDto } from './dto/create-alert.dto';
// import { UpdatePersonnelDto } from './dto/update-personnel.dto';
import { EmailService } from 'src/shared/mail/mail.service';
import { CreateTypeCongeDto } from './dto/create-type-conge.dto';
import { UpdatePersonnelDto } from './dto/rh.dto';
import { UploaderService } from '../shared/uploader/uploader.service';

@Injectable()
export class RhService {
  private readonly logger = new Logger(RhService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private uploaderService: UploaderService,
  ) { }

  // -----------------------------
  // Directions
  // -----------------------------
  async createDirection(dto: CreateDirectionDto) {
    return this.prisma.direction.create({ data: dto });
  }

  async getAllDirections() {
    return this.prisma.direction.findMany({
      include: { services: true },
    });
  }

  async getDirectionById(id: string) {
    const direction = await this.prisma.direction.findUnique({
      where: { id_direction: id },
      include: { services: true },
    });
    if (!direction) throw new NotFoundException('Direction non trouvée');
    return direction;
  }

  // -----------------------------
  // Services
  // -----------------------------
  async createService(dto: CreateServiceDto) {
    return this.prisma.service.create({ data: dto });
  }

  async getAllServices() {
    return this.prisma.service.findMany({ include: { personnels: true } });
  }

  async getServiceById(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id_service: id },
      include: { personnels: true, direction: true },
    });
    if (!service) throw new NotFoundException('Service non trouvé');
    return service;
  }

  // -----------------------------
  // Créer un personnel et envoyer un email de notification
  // -----------------------------
  /**
   * Crée un nouveau personnel dans le système.
   * Le mot de passe est hashé avant l'enregistrement.
   * Un email de bienvenue est envoyé.
   */
  async createPersonnel(dto: CreatePersonnelDto) {
    const prisma = this.prisma;

    return await prisma.$transaction(async (tx) => {
      try {
        // 1️⃣ Détermination du mot de passe
        const sanitizeName = (value?: string) =>
          (value ?? '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9]/g, '')
            .toLowerCase();

        const baseName = sanitizeName(dto.prenom_personnel) || sanitizeName(dto.nom_personnel);

        if (!baseName) {
          throw new BadRequestException('Le prénom ou le nom est requis pour générer le mot de passe');
        }

        const passwordToUse = `${baseName}@assnat.ci`;

        if (dto.role_personnel === 'CHEF_SERVICE') {
          this.logger.log(`🔐 Mot de passe auto-généré pour le chef de service`);
        }

        const hashedPassword = await bcrypt.hash(passwordToUse, 10);

        // 2️⃣ Création du personnel
        const personnel = await tx.personnel.create({
          data: {
            ...dto,
            password: hashedPassword,
            is_active: dto.role_personnel === 'CHEF_SERVICE',
          },
          include: { service: true },
        });

        this.logger.log(`✅ Personnel créé : ${personnel.prenom_personnel} ${personnel.nom_personnel}`);

        // 3️⃣ Si CHEF_SERVICE, mettre à jour la table service
        if (dto.role_personnel === 'CHEF_SERVICE') {
          await tx.service.update({
            where: { id_service: dto.id_service },
            data: { id_chefdeservice: personnel.id_personnel },
          });
          this.logger.log(`🔄 Service mis à jour avec id_chefdeservice = ${personnel.id_personnel}`);
        }

        // 4️⃣ Préparation du contenu email
        let subject: string;
        let message: string;
        const recipient = personnel.email_personnel!;

        if (dto.role_personnel === 'CHEF_SERVICE') {
          subject = 'Création de votre compte Chef de Service';
          message = `
          <p>Bonjour ${personnel.prenom_personnel} ${personnel.nom_personnel},</p>
          <p>Votre compte Chef de Service a été créé avec succès.</p>
          <p>Voici vos identifiants de connexion :</p>
          <ul>
            <li><strong>Email :</strong> ${personnel.email_personnel}</li>
            <li><strong>Mot de passe :</strong> ${passwordToUse}</li>
          </ul>
          <p>Veuillez modifier votre mot de passe après la première connexion.</p>
          <p>Cordialement,<br>L’équipe RH</p>
        `;

        } else {
          subject = 'Bienvenue dans le système de gestion des congés';
          message = `
          <p>Bonjour ${personnel.prenom_personnel} ${personnel.nom_personnel},</p>
          <p>Votre compte a été créé avec succès dans le système.</p>
          <p>Vous pouvez maintenant accéder à votre interface dédiée.</p>
          <p>Cordialement,<br>L’équipe RH</p>
        `;
        }

        // 5️⃣ Envoi d’email
        try {
          await this.emailService.sendNotificationEmail(recipient, subject, message);
          this.logger.log(`📩 Email envoyé à ${recipient}`);
        } catch (emailError) {
          this.logger.error(`❌ Erreur lors de l’envoi d’email: ${emailError.message}`);
          throw new Error('Échec lors de l’envoi de l’email');
        }

        // 6️⃣ Retour succès
        return { success: true, id: personnel.id_personnel };
      } catch (error) {
        this.logger.error(`🚨 Erreur lors de la création du personnel: ${error.message}`);
        throw new BadRequestException('Impossible de créer le personnel');
      }
    });
  }


  async getAllPersonnel() {
    return this.prisma.personnel.findMany({ include: { service: true } });
  }

  async getPersonnelById(id: string) {
    const personnel = await this.prisma.personnel.findUnique({
      where: { id_personnel: id },
      include: {
        service: true,
        demandes: true
      },
    });

    if (!personnel) {
      throw new NotFoundException('Personnel non trouvé');
    }

    return personnel;
  }


  async updatePersonnel(id: string, dto: UpdatePersonnelDto) {
    return this.prisma.personnel.update({
      where: { id_personnel: id },
      data: dto,
    });
  }

  async deletePersonnel(id: string) {
    return this.prisma.personnel.update({
      where: { id_personnel: id },
      data: { is_active: false },
    });
  }

  async archiverPersonnel(id: string) {
    const personnel = await this.prisma.personnel.findUnique({
      where: { id_personnel: id },
    });

    if (!personnel) {
      throw new NotFoundException('Personnel non trouvé');
    }
    return console.log('Personnel archivé');
    // return this.prisma.personnel.update({
    //   where: { id_personnel: id },
    //   data: { is_archiver: true },
    // });
  }

  // -----------------------------
  // Statistiques RH
  // -----------------------------
  async getStatistics() {
    const totalPersonnel = await this.prisma.personnel.count();
    const totalDirections = await this.prisma.direction.count();
    const totalServices = await this.prisma.service.count();

    return {
      totalPersonnel,
      totalDirections,
      totalServices,
    };
  }

  // -----------------------------
  // Alertes
  // -----------------------------
  async createAlert(dto: CreateAlertDto) {
    // Ici on peut juste créer une table alerts si tu veux
    // Pour l'exemple, on logue
    this.logger.log(`Alerte créée : ${JSON.stringify(dto)}`);
    return { message: 'Alerte créée', data: dto };
  }

  // -----------------------------
  // type de congés
  // -----------------------------

  async createTypeConge(dto: CreateTypeCongeDto) {
    try {
      return await this.prisma.typeConge.create({
        data: {
          libelle_typeconge: dto.libelle_typeconge,
          is_active: dto.is_active ?? true, // par défaut true
        },
      });
    } catch (error) {
      // Gestion des erreurs Prisma, par exemple unicité
      if (error.code === 'P2002') {
        throw new BadRequestException('Ce libellé de type de congé existe déjà');
      }
      throw error;
    }
  }

  // -----------------------------
  // Consulter toutes les demandes
  // -----------------------------
  async consulterDemandes() {
    return this.prisma.demande.findMany({
      where: {
        statut_demande: 'APPROUVEE', // filtre les demandes approuvées
      },
      include: {
        periodeConge: true,
        service: true,
        personnel: true,
        chefService: true,
      },
    });
  }

  // -----------------------------
  // Historique des demandes (REFUSEE, APPROUVEE, TERMINEE)
  // -----------------------------
  async getHistoriqueDemandes() {
    return this.prisma.demande.findMany({
      where: {
        statut_demande: {
          in: ['REFUSEE', 'APPROUVEE', 'TERMINEE'],
        },
      },
      include: {
        periodeConge: {
          include: { typeConge: true },
        },
        service: true,
        personnel: true,
        chefService: true,
        discussions: {
          orderBy: { date_message: 'desc' },
          take: 5, // Limiter à 5 dernières discussions
        },
        ficheDeConge: true,
      },
      orderBy: { date_demande: 'desc' },
    });
  }

  // -----------------------------
  // Interactions RH
  // -----------------------------
  async createInteractionRh(dto: CreateInteractionRhDto) {
    return this.prisma.interactionRh.create({
      data: {
        titre: dto.titre,
        message: dto.message,
        date: dto.date ? new Date(dto.date) : new Date(),
      },
    });
  }

  async getAllInteractionsRh() {
    return this.prisma.interactionRh.findMany({
      orderBy: { date: 'desc' },
    });
  }

  async deleteInteractionRh(id: string) {
    const interaction = await this.prisma.interactionRh.findUnique({
      where: { id_interaction_rh: id },
    });

    if (!interaction) {
      throw new NotFoundException('Interaction RH non trouvée');
    }

    return this.prisma.interactionRh.delete({
      where: { id_interaction_rh: id },
    });
  }

  // -----------------------------
  // Contrats
  // -----------------------------
  async createContrat(dto: CreateContratDto, file: Express.Multer.File) {
    // Vérifier que le personnel existe
    const personnel = await this.prisma.personnel.findUnique({
      where: { id_personnel: dto.id_personnel },
    });
  
    if (!personnel) {
      throw new NotFoundException('Personnel non trouvé');
    }
  
    // Vérifier que la date de début est fournie
    if (!dto.date_debut) {
      throw new BadRequestException('La date de début est obligatoire');
    }
  
    // Convertir les dates en objets Date valides
    const dateDebut = new Date(dto.date_debut);
    let dateFin: Date | null = null;
    if (dto.date_fin) {
      dateFin = new Date(dto.date_fin);
      if (dateFin <= dateDebut) {
        throw new BadRequestException('La date de fin doit être postérieure à la date de début');
      }
    }
  
    // Vérifier que le fichier est fourni
    if (!file) {
      throw new BadRequestException('Le fichier PDF du contrat est requis');
    }
  
    // Uploader le fichier sur GitHub
    let urlContrat: string;
    try {
      this.logger.log(`Upload du fichier contrat pour le personnel ${dto.id_personnel}`);
      urlContrat = await this.uploaderService.uploadPdfToGitHub(file);
      this.logger.log(`Fichier uploadé avec succès: ${urlContrat}`);
    } catch (error: any) {
      this.logger.error(`Erreur lors de l'upload du fichier: ${error.message}`);
      throw new BadRequestException(`Erreur lors de l'upload du fichier: ${error.message}`);
    }
  
    // Gérer salaire_reference - convertir en number ou null
    let salaireReference: number | null = null;
    if (dto.salaire_reference !== undefined && dto.salaire_reference !== null) {
      const parsed = Number(dto.salaire_reference);
      if (!isNaN(parsed)) {
        salaireReference = parsed;
      }
    }
  
    // Construire l'objet data pour Prisma
    const contratData = {
      type_contrat: dto.type_contrat,
      date_debut: dateDebut,
      date_fin: dateFin,
      salaire_reference: salaireReference,
      url_contrat: urlContrat,
      statut: dto.statut || 'Actif',
      id_personnel: dto.id_personnel,
    };
  
    // Log des données avant création
    this.logger.log(`Données du contrat à créer: ${JSON.stringify(contratData)}`);
  
    // Créer le contrat avec Prisma
    try {
      const contrat = await this.prisma.contrat.create({
        data: contratData,
        include: { personnel: true },
      });
      this.logger.log(`Contrat créé avec succès`);
      return contrat;
    } catch (error: any) {
      this.logger.error(`Erreur lors de la création du contrat: ${error.message}`);
      if (error.meta) {
        this.logger.error(`Détails Prisma: ${JSON.stringify(error.meta)}`);
      }
      throw new BadRequestException(`Erreur lors de la création du contrat: ${error.message}`);
    }
  }
  

  async getAllContrats() {
    return this.prisma.contrat.findMany({
      include: { personnel: true },
      orderBy: { date_creation: 'desc' },
    });
  }

  async getContratById(id: string) {
    const contrat = await this.prisma.contrat.findUnique({
      where: { id_contrat: id },
      include: { personnel: true },
    });

    if (!contrat) {
      throw new NotFoundException('Contrat non trouvé');
    }

    return contrat;
  }

  async getContratsByPersonnel(idPersonnel: string) {
    // Vérifier que le personnel existe
    const personnel = await this.prisma.personnel.findUnique({
      where: { id_personnel: idPersonnel },
    });

    if (!personnel) {
      throw new NotFoundException('Personnel non trouvé');
    }

    return this.prisma.contrat.findMany({
      where: { id_personnel: idPersonnel },
      include: { personnel: true },
      orderBy: { date_debut: 'desc' },
    });
  }

  async updateContrat(id: string, dto: UpdateContratDto) {
    const contrat = await this.prisma.contrat.findUnique({
      where: { id_contrat: id },
    });

    if (!contrat) {
      throw new NotFoundException('Contrat non trouvé');
    }

    // Vérifier que la date de fin est après la date de début si fournie
    const dateDebut = dto.date_debut || contrat.date_debut;
    const dateFin = dto.date_fin !== undefined ? dto.date_fin : contrat.date_fin;

    if (dateFin && dateFin <= dateDebut) {
      throw new BadRequestException('La date de fin doit être postérieure à la date de début');
    }

    return this.prisma.contrat.update({
      where: { id_contrat: id },
      data: {
        type_contrat: dto.type_contrat,
        date_debut: dto.date_debut,
        date_fin: dto.date_fin !== undefined ? (dto.date_fin || null) : undefined,
        salaire_reference: dto.salaire_reference,
        url_contrat: dto.url_contrat,
        statut: dto.statut,
      },
      include: { personnel: true },
    });
  }

  async deleteContrat(id: string) {
    const contrat = await this.prisma.contrat.findUnique({
      where: { id_contrat: id },
    });

    if (!contrat) {
      throw new NotFoundException('Contrat non trouvé');
    }

    return this.prisma.contrat.delete({
      where: { id_contrat: id },
    });
  }

  // -----------------------------
  // Paies
  // -----------------------------
  async createPaie(dto: CreatePaieDto, file: Express.Multer.File) {
    // Vérifier que le personnel existe
    const personnel = await this.prisma.personnel.findUnique({
      where: { id_personnel: dto.id_personnel },
    });

    if (!personnel) {
      throw new NotFoundException('Personnel non trouvé');
    }

    // Vérifier qu'il n'existe pas déjà une paie pour ce mois/année/personnel
    const existingPaie = await this.prisma.paie.findFirst({
      where: {
        id_personnel: dto.id_personnel,
        mois: dto.mois,
        annee: dto.annee,
      },
    });

    if (existingPaie) {
      throw new BadRequestException(`Une paie existe déjà pour ce personnel pour le mois ${dto.mois}/${dto.annee}`);
    }

    // Vérifier que le fichier est fourni
    if (!file) {
      throw new BadRequestException('Le fichier PDF du bulletin de paie est requis');
    }

    // Uploader le fichier sur GitHub
    let urlBulletin: string;
    try {
      this.logger.log(`Upload du fichier bulletin de paie pour le personnel ${dto.id_personnel}`);
      urlBulletin = await this.uploaderService.uploadPdfToGitHub(file);
      this.logger.log(`Fichier uploadé avec succès: ${urlBulletin}`);
    } catch (error: any) {
      this.logger.error(`Erreur lors de l'upload du fichier: ${error.message}`);
      throw new BadRequestException(`Erreur lors de l'upload du fichier: ${error.message}`);
    }

    // Gérer primes et deductions - convertir en number ou null
    let primes: number | null = null;
    if (dto.primes !== undefined && dto.primes !== null) {
      const parsed = Number(dto.primes);
      if (!isNaN(parsed)) {
        primes = parsed;
      }
    }

    let deductions: number | null = null;
    if (dto.deductions !== undefined && dto.deductions !== null) {
      const parsed = Number(dto.deductions);
      if (!isNaN(parsed)) {
        deductions = parsed;
      }
    }

    // Construire l'objet data pour Prisma
    const paieData = {
      mois: dto.mois,
      annee: dto.annee,
      salaire_net: Number(dto.salaire_net),
      salaire_brut: Number(dto.salaire_brut),
      primes: primes,
      deductions: deductions,
      url_bulletin: urlBulletin,
      id_personnel: dto.id_personnel,
    };

    // Log des données avant création
    this.logger.log(`Données de la paie à créer: ${JSON.stringify(paieData)}`);

    // Créer la paie avec Prisma
    try {
      const paie = await this.prisma.paie.create({
        data: paieData,
        include: { personnel: true },
      });
      this.logger.log(`Paie créée avec succès`);
      return paie;
    } catch (error: any) {
      this.logger.error(`Erreur lors de la création de la paie: ${error.message}`);
      if (error.meta) {
        this.logger.error(`Détails Prisma: ${JSON.stringify(error.meta)}`);
      }
      throw new BadRequestException(`Erreur lors de la création de la paie: ${error.message}`);
    }
  }

  async getAllPaies() {
    return this.prisma.paie.findMany({
      include: { personnel: true },
      orderBy: [{ annee: 'desc' }, { mois: 'desc' }],
    });
  }

  async getPaieById(id: string) {
    const paie = await this.prisma.paie.findUnique({
      where: { id_paie: id },
      include: { personnel: true },
    });

    if (!paie) {
      throw new NotFoundException('Paie non trouvée');
    }

    return paie;
  }

  async getPaiesByPersonnel(idPersonnel: string) {
    // Vérifier que le personnel existe
    const personnel = await this.prisma.personnel.findUnique({
      where: { id_personnel: idPersonnel },
    });

    if (!personnel) {
      throw new NotFoundException('Personnel non trouvé');
    }

    return this.prisma.paie.findMany({
      where: { id_personnel: idPersonnel },
      include: { personnel: true },
      orderBy: [{ annee: 'desc' }, { mois: 'desc' }],
    });
  }

  async getPaiesByMoisAnnee(mois: number, annee: number) {
    return this.prisma.paie.findMany({
      where: {
        mois,
        annee,
      },
      include: { personnel: true },
      orderBy: { date_creation: 'desc' },
    });
  }

  async updatePaie(id: string, dto: UpdatePaieDto) {
    const paie = await this.prisma.paie.findUnique({
      where: { id_paie: id },
    });

    if (!paie) {
      throw new NotFoundException('Paie non trouvée');
    }

    // Si le mois ou l'année change, vérifier qu'il n'existe pas déjà une paie pour ce mois/année/personnel
    const mois = dto.mois ?? paie.mois;
    const annee = dto.annee ?? paie.annee;

    if (dto.mois || dto.annee) {
      const existingPaie = await this.prisma.paie.findFirst({
        where: {
          id_personnel: paie.id_personnel,
          mois,
          annee,
          NOT: { id_paie: id },
        },
      });

      if (existingPaie) {
        throw new BadRequestException(`Une paie existe déjà pour ce personnel pour le mois ${mois}/${annee}`);
      }
    }

    return this.prisma.paie.update({
      where: { id_paie: id },
      data: {
        mois: dto.mois,
        annee: dto.annee,
        salaire_net: dto.salaire_net,
        salaire_brut: dto.salaire_brut,
        primes: dto.primes,
        deductions: dto.deductions,
        url_bulletin: dto.url_bulletin,
      },
      include: { personnel: true },
    });
  }

  async deletePaie(id: string) {
    const paie = await this.prisma.paie.findUnique({
      where: { id_paie: id },
    });

    if (!paie) {
      throw new NotFoundException('Paie non trouvée');
    }

    return this.prisma.paie.delete({
      where: { id_paie: id },
    });
  }

  // -----------------------------
  // Documents du Personnel
  // -----------------------------
  async createPersonnelDocument(dto: CreatePersonnelDocumentDto, file: Express.Multer.File) {
    // Vérifier que le personnel existe
    const personnel = await this.prisma.personnel.findUnique({
      where: { id_personnel: dto.id_personnel },
    });

    if (!personnel) {
      throw new NotFoundException('Personnel non trouvé');
    }

    // Vérifier que le fichier est fourni
    if (!file) {
      throw new BadRequestException('Le fichier du document est requis');
    }

    // Uploader le fichier sur GitHub
    let urlDocument: string;
    try {
      this.logger.log(`Upload du fichier document pour le personnel ${dto.id_personnel}`);
      urlDocument = await this.uploaderService.uploadFileToGitHubGeneric(file);
      this.logger.log(`Fichier uploadé avec succès: ${urlDocument}`);
    } catch (error: any) {
      this.logger.error(`Erreur lors de l'upload du fichier: ${error.message}`);
      throw new BadRequestException(`Erreur lors de l'upload du fichier: ${error.message}`);
    }

    // Construire l'objet data pour Prisma
    const documentData = {
      type_document: dto.type_document,
      url_document: urlDocument,
      id_personnel: dto.id_personnel,
    };

    // Log des données avant création
    this.logger.log(`Données du document à créer: ${JSON.stringify(documentData)}`);

    // Créer le document avec Prisma
    try {
      const document = await this.prisma.personnelDocument.create({
        data: documentData,
        include: { personnel: true },
      });
      this.logger.log(`Document créé avec succès`);
      return document;
    } catch (error: any) {
      this.logger.error(`Erreur lors de la création du document: ${error.message}`);
      if (error.meta) {
        this.logger.error(`Détails Prisma: ${JSON.stringify(error.meta)}`);
      }
      throw new BadRequestException(`Erreur lors de la création du document: ${error.message}`);
    }
  }

  async getAllPersonnelDocuments() {
    return this.prisma.personnelDocument.findMany({
      include: { personnel: true },
      orderBy: { date_ajout: 'desc' },
    });
  }

  async getPersonnelDocumentById(id: string) {
    const document = await this.prisma.personnelDocument.findUnique({
      where: { id_document: id },
      include: { personnel: true },
    });

    if (!document) {
      throw new NotFoundException('Document non trouvé');
    }

    return document;
  }

  async getPersonnelDocumentsByPersonnel(idPersonnel: string) {
    // Vérifier que le personnel existe
    const personnel = await this.prisma.personnel.findUnique({
      where: { id_personnel: idPersonnel },
    });

    if (!personnel) {
      throw new NotFoundException('Personnel non trouvé');
    }

    return this.prisma.personnelDocument.findMany({
      where: { id_personnel: idPersonnel },
      include: { personnel: true },
      orderBy: { date_ajout: 'desc' },
    });
  }

  async getPersonnelDocumentsByType(idPersonnel: string, typeDocument: string) {
    // Vérifier que le personnel existe
    const personnel = await this.prisma.personnel.findUnique({
      where: { id_personnel: idPersonnel },
    });

    if (!personnel) {
      throw new NotFoundException('Personnel non trouvé');
    }

    // Vérifier que le type de document est valide
    const validTypes = ['CNI', 'CONTRAT', 'DIPLOME', 'ATTestation'];
    if (!validTypes.includes(typeDocument)) {
      throw new BadRequestException(`Type de document invalide. Types valides: ${validTypes.join(', ')}`);
    }

    return this.prisma.personnelDocument.findMany({
      where: {
        id_personnel: idPersonnel,
        type_document: typeDocument as any,
      },
      include: { personnel: true },
      orderBy: { date_ajout: 'desc' },
    });
  }

  async updatePersonnelDocument(id: string, dto: UpdatePersonnelDocumentDto) {
    const document = await this.prisma.personnelDocument.findUnique({
      where: { id_document: id },
    });

    if (!document) {
      throw new NotFoundException('Document non trouvé');
    }

    return this.prisma.personnelDocument.update({
      where: { id_document: id },
      data: {
        type_document: dto.type_document,
        url_document: dto.url_document,
      },
      include: { personnel: true },
    });
  }

  async deletePersonnelDocument(id: string) {
    const document = await this.prisma.personnelDocument.findUnique({
      where: { id_document: id },
    });

    if (!document) {
      throw new NotFoundException('Document non trouvé');
    }

    return this.prisma.personnelDocument.delete({
      where: { id_document: id },
    });
  }

}