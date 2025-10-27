import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { CreateDemandeDto, CreatePeriodeCongeDto, CreateDiscussionDto } from './dto/user.dto';
import type { Personnel } from '@prisma/client';
import { StatutDemande } from '@prisma/client';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private prisma: PrismaService) { }

  // -----------------------------
  // Créer une demande
  // -----------------------------
  async createDemande(user: Personnel, dto: CreateDemandeDto) {
    this.logger.log(`Création d'une demande par ${user.email_travail}`);

    const periode = await this.prisma.periodeConge.findUnique({
      where: { id_periodeconge: dto.id_periodeconge },
      include: { typeConge: true },
    });
    if (!periode) throw new NotFoundException('Période de congé non trouvée');

    const existing = await this.prisma.demande.findFirst({
      where: {
        id_personnel: user.id_personnel,
        id_periodeconge: dto.id_periodeconge,
        statut_demande: { in: [StatutDemande.EN_ATTENTE, StatutDemande.APPROUVEE] },
      },
    });
    if (existing) throw new ConflictException('Vous avez déjà une demande en cours pour cette période');

    const chefService = await this.prisma.personnel.findFirst({
      where: { id_service: user.id_service, role_personnel: 'CHEF_SERVICE', is_active: true },
    });

    const demande = await this.prisma.demande.create({
      data: {
        type_demande: dto.type_demande,
        motif: dto.motif,
        id_personnel: user.id_personnel,
        id_service: user.id_service,
        id_periodeconge: dto.id_periodeconge,
        id_chef_service: chefService?.id_personnel,
      },
      include: {
        periodeConge: { include: { typeConge: true } },
        service: true,
      },
    });

    this.logger.log(`Demande créée: ${demande.id_demande}`);
    return demande;
  }

  // -----------------------------
  // Récupérer toutes les demandes de l'utilisateur
  // -----------------------------
  async getMyDemandes(user: Personnel) {
    this.logger.log(`Récupération des demandes de ${user.email_travail}`);
    return this.prisma.demande.findMany({
      where: { id_personnel: user.id_personnel },
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
  // Créer une période de congé
  // -----------------------------
  async createPeriodeConge(user: Personnel, dto: CreatePeriodeCongeDto) {
    this.logger.log(`Création d'une période de congé par ${user.email_travail}`);

    const type = await this.prisma.typeConge.findUnique({ where: { id_typeconge: dto.id_typeconge } });
    if (!type) throw new NotFoundException('Type de congé non trouvé');

    const debut = new Date(dto.date_debut);
    const fin = new Date(dto.date_fin);
    if (debut >= fin) throw new BadRequestException('La date de début doit être antérieure à la date de fin');

    const periode = await this.prisma.periodeConge.create({
      data: { date_debut: debut, date_fin: fin, nb_jour: dto.nb_jour, id_typeconge: dto.id_typeconge },
      include: { typeConge: true },
    });

    this.logger.log(`Période de congé créée: ${periode.id_periodeconge}`);
    return periode;
  }

  // -----------------------------
  // Ajouter une discussion à une demande
  // -----------------------------
  async addDiscussionToDemande(user: Personnel, demandeId: string, dto: CreateDiscussionDto) {
    this.logger.log(`Ajout d'une discussion à la demande ${demandeId} par ${user.email_travail}`);

    const demande = await this.prisma.demande.findFirst({
      where: { id_demande: demandeId, id_personnel: user.id_personnel },
    });
    if (!demande) throw new NotFoundException('Demande non trouvée ou non autorisée');

    const discussion = await this.prisma.discussion.create({
      data: { message: dto.message, heure_message: dto.heure_message, id_demande: demandeId },
    });

    this.logger.log(`Discussion ajoutée: ${discussion.id_discussion}`);
    return discussion;
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
}
