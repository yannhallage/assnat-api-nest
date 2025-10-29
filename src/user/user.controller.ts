import { Controller, Post, Get, Query, Param, Body, Logger, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { UserService } from './user.service';
import type { Personnel } from '@prisma/client';
import {
  CreateDemandeDto,
  // CreatePeriodeCongeDto,
  CreateDiscussionDto,
} from './dto/user.dto';

@ApiTags('Utilisateur')
@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) { }

  // -----------------------------
  // Créer une demande
  // -----------------------------
  @Post('demandes')
  @ApiOperation({ summary: 'Créer une nouvelle demande de congé' })
  @ApiResponse({ status: 201, description: 'Demande créée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides ou dates incorrectes' })
  @ApiQuery({
    name: 'id_personnel',
    description: 'ID du personnel créant la demande',
    required: true,
    example: 'uuid-personnel',
  })
  async createDemande(
    @Query('id_personnel') id_personnel: string,
    @Body() dto: CreateDemandeDto,
  ) {
    if (!id_personnel) {
      throw new BadRequestException('L\'ID du personnel est requis');
    }

    this.logger.log(`Création d'une demande pour le personnel ${id_personnel}`);
    return this.userService.createDemande(id_personnel, dto);
  }

  // -----------------------------
  // Récupérer toutes mes demandes
  // -----------------------------
  @Get('demandes')
  @ApiOperation({ summary: 'Récupérer toutes mes demandes' })
  @ApiResponse({ status: 200, description: 'Liste des demandes de l’utilisateur' })
  async getMyDemandes(@Query('id_personnel') id_personnel: string) {
    this.logger.log(`Récupération des demandes`);
    return this.userService.getMyDemandes(id_personnel);
  }

  // -----------------------------
  // Récupérer les détails d'une demande
  // -----------------------------
  @Get('demandes/:id')
  @ApiOperation({ summary: 'Récupérer les détails d\'une demande' })
  @ApiResponse({ status: 200, description: 'Détails de la demande' })
  @ApiResponse({ status: 404, description: 'Demande non trouvée' })
  async getDemandeDetails(
    @Body('user') user: Personnel,
    @Param('id') id: string,
  ) {
    this.logger.log(`Récupération des détails de la demande ${id} pour ${user.email_travail}`);
    return this.userService.getDemandeDetails(user, id);
  }

  // -----------------------------
  // Créer une période de congé
  // -----------------------------
  // @Post('periodes-conge')
  // @ApiOperation({ summary: 'Créer une nouvelle période de congé' })
  // @ApiResponse({ status: 201, description: 'Période de congé créée' })
  // @ApiResponse({ status: 400, description: 'Données invalides' })
  // async createPeriodeConge(
  //   @Body('user') user: Personnel,
  //   @Body() dto: CreatePeriodeCongeDto,
  // ) {
  //   this.logger.log(`Création d'une période de congé par ${user.email_travail}`);
  //   return this.userService.createPeriodeConge(user, dto);
  // }

  // -----------------------------
  // Récupérer les types de congé actifs
  // -----------------------------
  @Get('types-conge')
  @ApiOperation({ summary: 'Récupérer tous les types de congé actifs' })
  @ApiResponse({ status: 200, description: 'Liste des types de congé actifs' })
  async getTypesConge() {
    this.logger.log('Récupération des types de congé actifs');
    return this.userService.getTypesConge();
  }

  // -----------------------------
  // Ajouter une discussion à une demande
  // -----------------------------
  @Post('demandes/:id/discussions')
  @ApiOperation({ summary: 'Ajouter une discussion à une demande' })
  @ApiResponse({ status: 201, description: 'Discussion ajoutée' })
  @ApiResponse({ status: 404, description: 'Demande non trouvée' })
  @ApiQuery({
    name: 'id_personnel',
    description: 'ID du personnel ajoutant la discussion',
    required: true,
    example: 'uuid-personnel',
  })
  @ApiBody({
    description: 'Message de la discussion',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Voici mon message pour la demande' },
        heure_message: { type: 'string', format: 'date-time', example: '2025-10-29T10:30:00.000Z' },
      },
      required: ['message'],
    },
  })
  async addDiscussion(
    @Query('id_personnel') id_personnel: string,
    @Param('id') demandeId: string,
    @Body() dto: CreateDiscussionDto,
  ) {
    this.logger.log(
      `Ajout d'une discussion à la demande ${demandeId} par le personnel ${id_personnel}`,
    );
    return this.userService.addDiscussionToDemande(id_personnel, demandeId, dto);
  }


  // -----------------------------
  // recuperer les discussion à une demande
  // -----------------------------

  @Get('demandes/:id/discussions')
  @ApiOperation({ summary: 'Récupérer toutes les discussions d’une demande' })
  @ApiResponse({ status: 200, description: 'Liste des discussions' })
  @ApiResponse({ status: 404, description: 'Demande non trouvée' })
  async getDiscussions(
    @Body('id_personnel') id_personnel: string,
    @Param('id') demandeId: string,
  ) {
    this.logger.log(`Récupération des discussions pour la demande ${demandeId} par le personnel ${id_personnel}`);
    return this.userService.getDiscussionsByDemande(id_personnel, demandeId);
  }


  // prochaine route annulée la demandes et telechagerfiche congé
}