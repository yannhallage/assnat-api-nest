import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
// import { CreateDemandeDto, CreatePeriodeCongeDto, CreateDiscussionDto } from './dto/user.dto';
import { CreateDemandeDto, CreateDiscussionDto, UpdatePasswordDto, UpdatePersonalInfoDto } from './dto/user.dto';
import type { Personnel } from '@prisma/client';
import { StatutDemande } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class  UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private prisma: PrismaService) { }

  // -----------------------------
  // Créer une demande
  // -----------------------------

  async createDemande(id_personnel: string, dto: CreateDemandeDto) {
    let periodeCongeId = dto.id_periodeconge;

    // 1️⃣ Récupérer le personnel et son service
    const personnel = await this.prisma.personnel.findUnique({
      where: { id_personnel },
      include: { service: true }, // inclure le service pour récupérer id_chefdeservice
    });

    if (!personnel) throw new NotFoundException('Personnel non trouvé');

    // 2️⃣ Si le DTO contient les infos pour créer une période de congé
    if (dto.date_debut && dto.date_fin && dto.nb_jour && dto.id_typeconge) {
      const debut = new Date(dto.date_debut);
      const fin = new Date(dto.date_fin);

      if (debut >= fin) {
        throw new BadRequestException('La date de début doit être antérieure à la date de fin');
      }

      const type = await this.prisma.typeConge.findUnique({
        where: { id_typeconge: dto.id_typeconge },
      });
      if (!type) throw new NotFoundException('Type de congé non trouvé');

      const periode = await this.prisma.periodeConge.create({
        data: {
          date_debut: debut,
          date_fin: fin,
          nb_jour: dto.nb_jour,
          id_typeconge: dto.id_typeconge,
        },
        include: { typeConge: true },
      });

      this.logger.log(`Période de congé créée: ${periode.id_periodeconge}`);
      periodeCongeId = periode.id_periodeconge;
    }

    // 3️⃣ Créer la demande en récupérant l'id_chef_service depuis le service du personnel
    const demande = await this.prisma.demande.create({
      data: {
        type_demande: dto.type_demande,
        motif: dto.motif,
        id_personnel: personnel.id_personnel,
        id_service: personnel.id_service,
        id_periodeconge: periodeCongeId,
        id_chef_service: personnel.service?.id_chefdeservice || null, // ✅ récupération automatique
      },
      include: { periodeConge: true, service: true, personnel: true },
    });

    this.logger.log(`Demande créée: ${demande.id_demande}`);
    return demande;
  }




  // -----------------------------
  // Créer une période de congé
  // -----------------------------
  // async createPeriodeConge(user: Personnel, dto: CreatePeriodeCongeDto) {
  //   this.logger.log(`Création d'une période de congé`);

  //   const type = await this.prisma.typeConge.findUnique({ where: { id_typeconge: dto.id_typeconge } });
  //   if (!type) throw new NotFoundException('Type de congé non trouvé');

  //   const debut = new Date(dto.date_debut);
  //   const fin = new Date(dto.date_fin);
  //   if (debut >= fin) throw new BadRequestException('La date de début doit être antérieure à la date de fin');

  //   const periode = await this.prisma.periodeConge.create({
  //     data: { date_debut: debut, date_fin: fin, nb_jour: dto.nb_jour, id_typeconge: dto.id_typeconge },
  //     include: { typeConge: true },
  //   });

  //   this.logger.log(`Période de congé créée: ${periode.id_periodeconge}`);
  //   return periode;
  // }

  // -----------------------------
  // Récupérer toutes les demandes de l'utilisateur
  // -----------------------------
  async getMyDemandes(id_personnel: string) {
    this.logger.log(`Récupération des demandes (EN_ATTENTE et APPROUVEE) pour ${id_personnel}`);
    return this.prisma.demande.findMany({
      where: {
        id_personnel,
        statut_demande: {
          in: ['EN_ATTENTE', 'APPROUVEE'],
        },
      },
      include: {
        periodeConge: { include: { typeConge: true } },
        service: true,
        discussions: { orderBy: { date_message: 'desc' } },
        ficheDeConge: true,
      },
      orderBy: { date_demande: 'desc' },
    });
  }



  // -----------------------------
  // Récupérer les fiches de congé
  // -----------------------------
  async getMyFichesConge(user: Personnel) {
    this.logger.log(`Récupération des fiches de congé pour ${user.email_travail}`);
    return this.prisma.ficheDeConge.findMany({
      where: { id_personnel: user.id_personnel },
      include: {
        demande: { include: { periodeConge: { include: { typeConge: true } } } },
      },
      orderBy: { date_message: 'desc' },
    });
  }

  // -----------------------------
  // Récupérer tous les types de congé actifs
  // -----------------------------
  async getTypesConge() {
    this.logger.log('Récupération des types de congé actifs');
    return this.prisma.typeConge.findMany({
      where: { is_active: true },
      orderBy: { libelle_typeconge: 'asc' },
    });
  }

  // -----------------------------
  // Ajouter une discussion à une demande
  // -----------------------------
  async addDiscussionToDemande(id_personnel: string, demandeId: string, dto: CreateDiscussionDto) {
    this.logger.log(`Ajout d'une discussion à la demande ${demandeId}`);

    const demande = await this.prisma.demande.findFirst({
      where: { id_demande: demandeId, id_personnel: id_personnel },
    });
    if (!demande) throw new NotFoundException('Demande non trouvée ou non autorisée');

    const discussion = await this.prisma.discussion.create({
      data: { message: dto.message, heure_message: dto.heure_message, id_demande: demandeId },
    });

    this.logger.log(`Discussion ajoutée: ${discussion.id_discussion}`);
    return discussion;
  }
  // -----------------------------
  // recuperer les discussion à une demande
  // -----------------------------
  async getDiscussionsByDemande(id_personnel: string, demandeId: string) {
    this.logger.log(`Récupération des discussions pour la demande ${demandeId}`);

    // Vérifier que la demande existe et appartient bien au personnel
    const demande = await this.prisma.demande.findFirst({
      where: { id_demande: demandeId, id_personnel },
    });
    if (!demande) throw new NotFoundException('Demande non trouvée ou non autorisée');

    // Récupérer les discussions liées à la demande, triées par date croissante
    const discussions = await this.prisma.discussion.findMany({
      where: { id_demande: demandeId },
      orderBy: { heure_message: 'asc' },
    });

    this.logger.log(`Nombre de discussions récupérées: ${discussions.length}`);
    return discussions;
  }

  // -----------------------------
  // Récupérer les détails d'une demande
  // -----------------------------
  async getDemandeDetails(user: Personnel, demandeId: string) {
    this.logger.log(`Récupération des détails de la demande ${demandeId} par ${user.email_travail}`);

    const demande = await this.prisma.demande.findFirst({
      where: { id_demande: demandeId, id_personnel: user.id_personnel },
      include: {
        periodeConge: { include: { typeConge: true } },
        service: true,
        discussions: { orderBy: { date_message: 'asc' } },
        ficheDeConge: true,
      },
    });

    if (!demande) throw new NotFoundException('Demande non trouvée ou non autorisée');
    return demande;
  }

  // -----------------------------
  // Récupérer les historiques d'une demande
  // -----------------------------
  async getHistoriqueDemandes(id_personnel: string) {
    this.logger.log(`Récupération des demandes (TERMINEE et REFUSEE) pour ${id_personnel}`);
    return this.prisma.demande.findMany({
      where: {
        id_personnel,
        statut_demande: { in: ['TERMINEE', 'REFUSEE'] },
      },
      include: {
        periodeConge: { include: { typeConge: true } },
        service: true,
        discussions: { orderBy: { date_message: 'desc' } },
        ficheDeConge: true,
      },
      orderBy: { date_demande: 'desc' },
    });
  }

  // -----------------------------
  // Mettre à jour le mot de passe
  // -----------------------------
  async updatePassword(id_personnel: string, dto: UpdatePasswordDto) {
    this.logger.log(`Mise à jour du mot de passe pour le personnel ${id_personnel}`);

    // Récupérer le personnel
    const personnel = await this.prisma.personnel.findUnique({
      where: { id_personnel },
    });

    if (!personnel) {
      throw new NotFoundException('Personnel non trouvé');
    }

    if (!personnel.password) {
      throw new BadRequestException('Aucun mot de passe défini pour ce compte');
    }

    // Vérifier l'ancien mot de passe
    const isOldPasswordValid = await bcrypt.compare(dto.ancien_mot_de_passe, personnel.password);
    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Ancien mot de passe incorrect');
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(dto.nouveau_mot_de_passe, 10);

    // Mettre à jour le mot de passe
    const updatedPersonnel = await this.prisma.personnel.update({
      where: { id_personnel },
      data: { password: hashedPassword },
      select: {
        id_personnel: true,
        nom_personnel: true,
        prenom_personnel: true,
        email_travail: true,
      },
    });

    this.logger.log(`Mot de passe mis à jour pour ${updatedPersonnel.email_travail}`);
    return { message: 'Mot de passe mis à jour avec succès', personnel: updatedPersonnel };
  }

  // -----------------------------
  // Mettre à jour les informations personnelles
  // -----------------------------
  async updatePersonalInfo(id_personnel: string, dto: UpdatePersonalInfoDto) {
    this.logger.log(`Mise à jour des informations personnelles pour le personnel ${id_personnel}`);

    // Vérifier que le personnel existe
    const personnel = await this.prisma.personnel.findUnique({
      where: { id_personnel },
    });

    if (!personnel) {
      throw new NotFoundException('Personnel non trouvé');
    }

    // Préparer les données à mettre à jour
    const updateData: any = {};

    if (dto.telephone_travail !== undefined) {
      updateData.telephone_travail = dto.telephone_travail;
    }
    if (dto.telephone_personnel !== undefined) {
      updateData.telephone_personnel = dto.telephone_personnel;
    }
    if (dto.ville_personnel !== undefined) {
      updateData.ville_personnel = dto.ville_personnel;
    }
    if (dto.telephone_contact_urgence !== undefined) {
      updateData.telephone_contact_urgence = dto.telephone_contact_urgence;
    }
    if (dto.nom_contact_urgence !== undefined) {
      updateData.nom_contact_urgence = dto.nom_contact_urgence;
    }
    if (dto.date_naissance !== undefined) {
      updateData.date_naissance = new Date(dto.date_naissance);
    }

    // Mettre à jour le personnel
    const updatedPersonnel = await this.prisma.personnel.update({
      where: { id_personnel },
      data: updateData,
      select: {
        id_personnel: true,
        nom_personnel: true,
        prenom_personnel: true,
        email_travail: true,
        telephone_travail: true,
        telephone_personnel: true,
        ville_personnel: true,
        telephone_contact_urgence: true,
        nom_contact_urgence: true,
        date_naissance: true,
      },
    });

    this.logger.log(`Informations personnelles mises à jour pour ${updatedPersonnel.email_travail}`);
    return updatedPersonnel;
  }

  // -----------------------------
  // Récupérer la disponibilité d'un personnel
  // -----------------------------
  async getDisponibilite(id_personnel: string) {
    this.logger.log(`Récupération de la disponibilité pour le personnel ${id_personnel}`);

    const personnel = await this.prisma.personnel.findUnique({
      where: { id_personnel },
      select: {
        id_personnel: true,
        disponibilité_day: true,
      },
    });

    if (!personnel) {
      throw new NotFoundException('Personnel non trouvé');
    }

    return {
      // id_personnel: personnel.id_personnel,
      disponibilité_day: personnel.disponibilité_day,
    };
  }

}
