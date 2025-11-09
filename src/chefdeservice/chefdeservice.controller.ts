import { Controller, Get, Put, Post, Query, Delete, UseGuards,UnauthorizedException, Request,Body, Param, Logger, BadRequestException } from '@nestjs/common';
import { InvitePersonnelDto } from './dto/Inviter.dto'

import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBody, ApiResponse } from '@nestjs/swagger';
import { ChefdeserviceService } from './chefdeservice.service';
import { ApproveDemandeDto, RejectDemandeDto } from './dto/chef.dto';
import type { Personnel } from '@prisma/client';
import { CreateDiscussionDto } from 'src/user/dto/user.dto';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
type ChefWithRelations = Personnel & {
  service?: {
    nom_service: string;
    directions?: {
      nom_direction: string;
    };
  };
};
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Chef de Service')
@Controller('chef')
export class ChefdeserviceController {
  private readonly logger = new Logger(ChefdeserviceController.name);

  constructor(private readonly chefdeserviceService: ChefdeserviceService) { }

  // -----------------------------
  // Inviter un personnel
  // -----------------------------
  @Post('personnel/invite')
  @ApiOperation({ summary: 'Inviter un personnel dans le service' })
  @ApiBody({
    description: 'Informations pour inviter un nouveau personnel',
    type: InvitePersonnelDto,
    examples: {
      exemple: {
        value: {
          nom_personnel: 'Doe',
          prenom_personnel: 'John',
          email_personnel: 'john.doe@assnat.qc.ca',
          role_personnel: 'EMPLOYE',
          type_personnel: 'PERMANENT',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Invitation envoyée avec succès' })
  @ApiResponse({ status: 400, description: 'Requête invalide' })
  async invitePersonnel(
    @Body() inviteDto: InvitePersonnelDto,
  ) {
    return this.chefdeserviceService.invitePersonnel(inviteDto);
  }

  // -----------------------------
  // Consulter toutes les demandes du service
  // -----------------------------
  @Get('demandes')
  @ApiOperation({ summary: 'Consulter toutes les demandes de son service' })
  @ApiResponse({ status: 200, description: 'Liste des demandes du service' })
  @ApiResponse({ status: 404, description: 'Chef non trouvé ou service vide' })
  @ApiQuery({ name: 'id_chef', description: 'ID du chef de service', required: true, example: 'uuid-chef' })
  async getServiceDemandes(@Query('id_chef') id_chef: string) {
    this.logger.log(`Récupération des demandes du service pour le chef ${id_chef}`);
    return this.chefdeserviceService.getServiceDemandes(id_chef);
  }

  // -----------------------------
  // Approuver une demande
  // -----------------------------
  @Put('demandes/:id/approve')
  @ApiOperation({ summary: 'Approuver une demande de congé' })
  @ApiResponse({ status: 200, description: 'Demande approuvée avec succès' })
  async approveDemande(
    @Param('id') demandeId: string,
    @Body() approveDto: ApproveDemandeDto,
    @Body('chef') chef: ChefWithRelations,
  ) {
    this.logger.log(`Approbation de la demande`);
    return this.chefdeserviceService.approveDemande(chef, demandeId, approveDto);
  }

  // -----------------------------
  // Refuser une demande
  // -----------------------------
  @Put('demandes/:id/reject')
  @ApiOperation({ summary: 'Refuser une demande de congé' })
  @ApiResponse({ status: 200, description: 'Demande refusée avec succès' })
  async rejectDemande(
    @Param('id') demandeId: string,
    @Body() rejectDto: RejectDemandeDto,
    @Body('chef') chef: ChefWithRelations,
  ) {
    this.logger.log(`Refus de la demande`);
    return this.chefdeserviceService.rejectDemande(chef, demandeId, rejectDto);
  }

  // -----------------------------
  // Révoquer une demande approuvée
  // -----------------------------
  @Put('demandes/:id/revoke')
  @ApiOperation({ summary: 'Révoquer une demande approuvée' })
  @ApiResponse({ status: 200, description: 'Demande révoquée avec succès' })
  async revokeDemande(
    @Param('id') demandeId: string,
    @Body('chef') chef: ChefWithRelations,
  ) {
    this.logger.log(`Révocation de la demande ${demandeId} par ${chef.email_travail}`);
    return this.chefdeserviceService.revokeDemande(chef, demandeId);
  }

  // -----------------------------
  // Supprimer une demande
  // -----------------------------
  @Delete('demandes/:id')
  @ApiOperation({ summary: 'Supprimer une demande' })
  @ApiResponse({ status: 200, description: 'Demande supprimée avec succès' })
  async deleteDemande(
    @Param('id') demandeId: string,
    @Body('chef') chef: ChefWithRelations,
  ) {
    this.logger.log(`Suppression de la demande ${demandeId} par ${chef.email_travail}`);
    return this.chefdeserviceService.deleteDemande(chef, demandeId);
  }

  // -----------------------------
  // Consulter le personnel du service
  // -----------------------------
  @Get('personnel/:serviceId')
  @ApiOperation({ summary: 'Consulter le personnel d’un service' })
  @ApiParam({
    name: 'serviceId',
    type: String,
    description: 'ID du service pour lequel récupérer le personnel',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste du personnel du service',
    schema: {
      type: 'array',
      items: {
        example: {
          id_personnel: 'uuid1',
          nom_personnel: 'Hallage',
          prenom_personnel: 'Yann',
          role_personnel: 'CHEF_SERVICE',
          email_personnel: 'yann.hallage@assnat.qc.ca',
          email_travail: 'yann.hallage@assnat.qc.ca',
          is_active: true,
          service: {
            id_service: '123e4567-e89b-12d3-a456-426614174000',
            nom_service: 'Ressources Humaines',
          },
          _count: {
            demandes: 5,
            fichesConge: 2,
            demandesEnCoursChef: 3,
          },
        },
      },
    },
  })
  async getServicePersonnel(@Param('serviceId') serviceId: string) {
    if (!serviceId) {
      this.logger.warn(`Service ID manquant`);
      throw new BadRequestException('L’ID du service est requis');
    }

    this.logger.log(`Récupération du personnel du service ${serviceId}`);
    return this.chefdeserviceService.getServicePersonnel(serviceId);
  }

  @Get('historique-demandes')
  @Roles('CHEF_SERVICE', 'ADMIN')
  @ApiOperation({ summary: 'Récupérer les demandes terminées ou refusées de l’utilisateur' })
  @ApiResponse({ status: 200, description: 'Liste des demandes terminées ou refusées' })
  async getHistoriqueDemandes(@Request() req) {
    const id_chef = req.user?.id;
    if (!id_chef) {
      throw new UnauthorizedException('Utilisateur non identifié');
    }

    this.logger.log(`Récupération de l’historique des demandes pour le chef ${id_chef}`);
    return this.chefdeserviceService.getHistoriqueDemandes(id_chef);
  }
  // -----------------------------
  // Ajouter une discussion à une demande
  // -----------------------------
  @Post('demandes/:id/discussions')
  @ApiOperation({ summary: 'Ajouter une discussion à une demande' })
  @ApiResponse({ status: 201, description: 'Discussion ajoutée' })
  @ApiResponse({ status: 404, description: 'Demande non trouvée' })
  @ApiQuery({
    name: 'id_chef',
    description: 'ID du chef de service ajoutant la discussion',
    required: true,
    example: 'uuid-chef',
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
    @Query('id_chef') id_chef: string,
    @Param('id') demandeId: string,
    @Body() dto: CreateDiscussionDto,
  ) {
    this.logger.log(
      `Ajout d'une discussion à la demande ${demandeId} par le personnel ${id_chef}`,
    );
    return this.chefdeserviceService.addDiscussionToDemande(id_chef, demandeId, dto);
  }
}