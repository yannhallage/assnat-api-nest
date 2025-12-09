import { Controller, Post, Get, Put, Query, Param, Body, UseGuards, UnauthorizedException, Request, Logger, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { UserService } from './user.service';
import type { Personnel } from '@prisma/client';
import {
  CreateDemandeDto,
  // CreatePeriodeCongeDto,
  CreateDiscussionDto,
  UpdatePasswordDto,
  UpdatePersonalInfoDto,
} from './dto/user.dto';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';

@ApiTags('Utilisateur')
@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) { }

  // -----------------------------
  // Créer une demande
  // -----------------------------
  @Post('demandes')
  @Roles('EMPLOYE', 'CHEF_SERVICE', 'RH', 'ADMIN')
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
  // Récupérer la disponibilité
  // -----------------------------
  @Get('disponibilite/:id')
  @Roles('EMPLOYE', 'CHEF_SERVICE', 'RH', 'ADMIN')
  @ApiOperation({ summary: 'Récupérer la disponibilité d\'un utilisateur' })
  @ApiResponse({ status: 200, description: 'Disponibilité récupérée avec succès' })
  @ApiResponse({ status: 404, description: 'Personnel non trouvé' })
  async getDisponibilite(@Param('id') id: string) {
    this.logger.log(`Récupération de la disponibilité pour ${id}`);
    return this.userService.getDisponibilite(id);
  }
    // -----------------------------
  // Mettre à jour le mot de passe
  // -----------------------------
  @Put('password/:id')
  @Roles('EMPLOYE', 'CHEF_SERVICE', 'RH', 'ADMIN')
  @ApiOperation({ summary: 'Mettre à jour le mot de passe' })
  @ApiResponse({ status: 200, description: 'Mot de passe mis à jour avec succès' })
  @ApiResponse({ status: 401, description: 'Ancien mot de passe incorrect' })
  @ApiResponse({ status: 404, description: 'Personnel non trouvé' })
  async updatePassword(
    @Param('id') id: string,
    @Body() dto: UpdatePasswordDto,
  ) {
    this.logger.log(`Mise à jour du mot de passe pour le personnel ${id}`);
    return this.userService.updatePassword(id, dto);
  }

  // -----------------------------
  // Mettre à jour les informations personnelles
  // -----------------------------
  @Put('info/:id')
  @Roles('EMPLOYE', 'CHEF_SERVICE', 'RH', 'ADMIN')
  @ApiOperation({ summary: 'Mettre à jour les informations personnelles' })
  @ApiResponse({ status: 200, description: 'Informations personnelles mises à jour avec succès' })
  @ApiResponse({ status: 404, description: 'Personnel non trouvé' })
  async updatePersonalInfo(
    @Param('id') id: string,
    @Body() dto: UpdatePersonalInfoDto,
  ) {
    this.logger.log(`Mise à jour des informations personnelles pour le personnel ${id}`);
    return this.userService.updatePersonalInfo(id, dto);
  }
  // -----------------------------
  // Récupérer toutes mes demandes
  // -----------------------------
  @Get('demandes')
  @Roles('EMPLOYE', 'CHEF_SERVICE', 'RH', 'ADMIN')
  @ApiOperation({ summary: 'Récupérer toutes mes demandes' })
  @ApiResponse({ status: 200, description: 'Liste des demandes de l’utilisateur' })
  async getMyDemandes(@Request() req) {
    const user = req.user?.id; // injecté par JwtAuthGuard
    this.logger.log(`Création d'une demande pour le personnel ${user}`);
    if (!user) {
      throw new UnauthorizedException('Utilisateur non identifié');
    }

    // Récupère toutes les demandes EN_ATTENTE ou APPROUVEE
    return this.userService.getMyDemandes(user);
  }

  // -----------------------------
  // Récupérer les détails d'une demande
  // -----------------------------
  @Get('demandes/:id')
  @Roles('EMPLOYE', 'CHEF_SERVICE', 'RH', 'ADMIN')
  @ApiOperation({ summary: 'Récupérer les détails d\'une demande' })
  @ApiResponse({ status: 200, description: 'Détails de la demande' })
  @ApiResponse({ status: 404, description: 'Demande non trouvée' })
  async getDemandeDetails(
    // @Body('user') user: Personnel,
    @Param('id') id: string,
  ) {
    this.logger.log(`Récupération des détails de la demande ${id}`);
    return this.userService.getDemandeDetails(id);
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
  @Roles('EMPLOYE', 'CHEF_SERVICE', 'RH', 'ADMIN')
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
  @Roles('EMPLOYE', 'CHEF_SERVICE', 'RH', 'ADMIN')
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
  // Récupérer les discussions d'une demande
  // -----------------------------
  @Get('demandes/:id/discussions')
  @Roles('EMPLOYE', 'CHEF_SERVICE', 'RH', 'ADMIN')
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
  // -----------------------------
  // Récupérer les historiques des demande
  // -----------------------------
  @Get('historique-demandes')
  @Roles('EMPLOYE', 'CHEF_SERVICE', 'RH', 'ADMIN')
  @ApiOperation({ summary: 'Récupérer les demandes terminées ou refusées de l’utilisateur' })
  @ApiResponse({ status: 200, description: 'Liste des demandes terminées ou refusées' })
  async getHistoriqueDemandes(@Request() req) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Utilisateur non identifié');
    }

    this.logger.log(`Récupération de l'historique des demandes pour ${userId}`);
    return this.userService.getHistoriqueDemandes(userId);
  }

  // -----------------------------
  // Interactions RH
  // -----------------------------
  @Get('interactions-rh')
  @Roles('EMPLOYE', 'CHEF_SERVICE', 'RH', 'ADMIN')
  @ApiOperation({ summary: 'Récupérer toutes les interactions RH' })
  @ApiResponse({ status: 200, description: 'Liste des interactions RH' })
  async getAllInteractionsRh() {
    this.logger.log('Récupération de toutes les interactions RH');
    return this.userService.getAllInteractionsRh();
  }
  // prochaine route annulée la demandes et telechager fiche congé
}
