import { Controller, Get, Put, Delete, Body, Param, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ChefdeserviceService } from './chefdeservice.service';
import { ApproveDemandeDto, RejectDemandeDto } from './dto/chef.dto';
import type { Personnel } from '@prisma/client';

type ChefWithRelations = Personnel & {
  service?: {
    nom_service: string;
    directions?: {
      nom_direction: string;
    };
  };
};

@ApiTags('Chef de Service')
@Controller('chef')
export class ChefdeserviceController {
  private readonly logger = new Logger(ChefdeserviceController.name);

  constructor(private readonly chefdeserviceService: ChefdeserviceService) { }

  // -----------------------------
  // Consulter toutes les demandes du service
  // -----------------------------
  @Get('demandes')
  @ApiOperation({ summary: 'Consulter toutes les demandes de son service' })
  @ApiResponse({ status: 200, description: 'Liste des demandes du service' })
  async getServiceDemandes(@Body('chef') chef: ChefWithRelations) {
    this.logger.log(`Récupération des demandes du service par ${chef.email_travail}`);
    return this.chefdeserviceService.getServiceDemandes(chef);
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
    this.logger.log(`Approbation de la demande ${demandeId} par ${chef.email_travail}`);
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
    this.logger.log(`Refus de la demande ${demandeId} par ${chef.email_travail}`);
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
  @Get('personnel')
  @ApiOperation({ summary: 'Consulter le personnel de son service' })
  @ApiResponse({ status: 200, description: 'Liste du personnel du service' })
  async getServicePersonnel(@Body('chef') chef: ChefWithRelations) {
    this.logger.log(`Récupération du personnel du service par ${chef.email_travail}`);
    return this.chefdeserviceService.getServicePersonnel(chef);
  }
}
