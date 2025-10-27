import { Controller, Post, Get, Param, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Personnel } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import {
  CreateDemandeDto,
  CreatePeriodeCongeDto,
  CreateDiscussionDto,
} from './dto/user.dto';

@ApiTags('Utilisateur')
@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  private prisma = new PrismaClient();

  // -----------------------------
  // Créer une demande
  // -----------------------------
  @Post('demandes')
  @ApiOperation({ summary: 'Créer une nouvelle demande de congé' })
  async createDemande(
    @Body('user') user: Personnel,
    @Body() dto: CreateDemandeDto,
  ) {
    this.logger.log(`Création d'une demande par ${user.email_travail}`);
    return this.prisma.demande.create({
      data: {
        type_demande: dto.type_demande,
        id_personnel: user.id_personnel,
        id_service: user.id_service,
        motif: dto.motif,
      },
    });
  }

  // -----------------------------
  // Récupérer toutes mes demandes
  // -----------------------------
  @Get('demandes')
  @ApiOperation({ summary: 'Récupérer toutes mes demandes' })
  async getMyDemandes(@Body('user') user: Personnel) {
    this.logger.log(`Récupération des demandes de ${user.email_travail}`);
    return this.prisma.demande.findMany({
      where: { id_personnel: user.id_personnel },
      include: {
        periodeConge: true,
        discussions: true,
        ficheDeConge: true,
        service: true,
        personnel: true,
      },
      orderBy: { date_demande: 'desc' },
    });
  }

  // -----------------------------
  // Récupérer les détails d'une demande
  // -----------------------------
  @Get('demandes/:id')
  @ApiOperation({ summary: 'Récupérer les détails d\'une demande' })
  async getDemandeDetails(
    @Body('user') user: Personnel,
    @Param('id') id: string,
  ) {
    this.logger.log(`Récupération des détails de la demande ${id} pour ${user.email_travail}`);
    return this.prisma.demande.findFirst({
      where: { id_demande: id, id_personnel: user.id_personnel },
      include: {
        periodeConge: true,
        discussions: true,
        ficheDeConge: true,
        service: true,
        personnel: true,
      },
    });
  }

  // -----------------------------
  // Créer une période de congé
  // -----------------------------
  @Post('periodes-conge')
  @ApiOperation({ summary: 'Créer une nouvelle période de congé' })
  async createPeriodeConge(
    @Body('user') user: Personnel,
    @Body() dto: CreatePeriodeCongeDto,
  ) {
    this.logger.log(`Création d'une période de congé par ${user.email_travail}`);
    return this.prisma.periodeConge.create({
      data: {
        date_debut: dto.date_debut,
        date_fin: dto.date_fin,
        nb_jour: dto.nb_jour,
        id_typeconge: dto.id_typeconge,
      },
    });
  }

  // -----------------------------
  // Récupérer les types de congé actifs
  // -----------------------------
  @Get('types-conge')
  @ApiOperation({ summary: 'Récupérer tous les types de congé actifs' })
  async getTypesConge() {
    this.logger.log('Récupération des types de congé actifs');
    return this.prisma.typeConge.findMany({ where: { is_active: true } });
  }

  // -----------------------------
  // Ajouter une discussion à une demande
  // -----------------------------
  @Post('demandes/:id/discussions')
  @ApiOperation({ summary: 'Ajouter une discussion à une demande' })
  async addDiscussion(
    @Body('user') user: Personnel,
    @Param('id') demandeId: string,
    @Body() dto: CreateDiscussionDto,
  ) {
    this.logger.log(`Ajout d'une discussion à la demande ${demandeId} par ${user.email_travail}`);
    return this.prisma.discussion.create({
      data: {
        message: dto.message,
        id_demande: demandeId,
      },
    });
  }
}
