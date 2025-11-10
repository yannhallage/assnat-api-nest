import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RhService } from './rh.service';
import {
  CreateDirectionDto,
  CreateServiceDto,
  CreatePersonnelDto,
  UpdatePersonnelDto,
  // CreateAlertDto,
} from './dto/rh.dto';
import { CreateTypeCongeDto } from './dto/create-type-conge.dto';
import { RolesGuard } from 'src/shared/guards/roles.guard';
// import { Roles } from 'src/shared/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Ressources Humaines')
@Controller('rh')
export class RhController {
  private readonly logger = new Logger(RhController.name);

  constructor(private readonly rhService: RhService) { }

  // ---------------
  // Directions
  // -----------------------------
  @Post('directions')
  @ApiOperation({ summary: 'Créer une nouvelle direction' })
  @ApiResponse({ status: 201, description: 'Direction créée avec succès' })
  async createDirection(@Body() dto: CreateDirectionDto) {
    this.logger.log(`Création d'une direction: ${dto.nom_direction}`);
    return this.rhService.createDirection(dto);
  }

  @Get('directions')
  @ApiOperation({ summary: 'Récupérer toutes les directions' })
  @ApiResponse({ status: 200, description: 'Liste des directions' })
  async getAllDirections() {
    this.logger.log('Récupération de toutes les directions');
    return this.rhService.getAllDirections();
  }

  @Get('directions/:id')
  @ApiOperation({ summary: 'Récupérer une direction par ID' })
  @ApiResponse({ status: 200, description: 'Direction trouvée' })
  async getDirectionById(@Param('id') id: string) {
    this.logger.log(`Récupération de la direction ${id}`);
    return this.rhService.getDirectionById(id);
  }

  // -----------------------------
  // Services
  // -----------------------------
  @Post('services')
  @ApiOperation({ summary: 'Créer un nouveau service' })
  @ApiResponse({ status: 201, description: 'Service créé avec succès' })
  async createService(@Body() dto: CreateServiceDto) {
    this.logger.log(`Création d'un service: ${dto.nom_service}`);
    return this.rhService.createService(dto);
  }

  @Get('services')
  @ApiOperation({ summary: 'Récupérer tous les services' })
  @ApiResponse({ status: 200, description: 'Liste des services' })
  async getAllServices() {
    this.logger.log('Récupération de tous les services');
    return this.rhService.getAllServices();
  }

  @Get('services/:id')
  @ApiOperation({ summary: 'Récupérer un service par ID' })
  @ApiResponse({ status: 200, description: 'Service trouvé' })
  async getServiceById(@Param('id') id: string) {
    this.logger.log(`Récupération du service ${id}`);
    return this.rhService.getServiceById(id);
  }

  // -----------------------------
  // Personnel
  // -----------------------------
  @Post('personnels')
  @ApiOperation({ summary: 'Créer un nouveau personnel' })
  @ApiResponse({ status: 201, description: 'Personnel créé avec succès' })
  async createPersonnel(@Body() dto: CreatePersonnelDto) {
    this.logger.log(`Création du personnel`);
    return this.rhService.createPersonnel(dto);
  }
  // -----------------------------
  // Typede congé
  // -----------------------------
  @Post('types-conge')
  @ApiOperation({ summary: 'Créer un nouveau type de congé' })
  @ApiResponse({ status: 201, description: 'Type de congé créé avec succès' })
  @ApiResponse({ status: 400, description: 'Libellé déjà existant ou données invalides' })
  async createTypeConge(@Body() dto: CreateTypeCongeDto) {
    return this.rhService.createTypeConge(dto);
  }

  @Get('personnels')
  @ApiOperation({ summary: 'Récupérer tout le personnel' })
  @ApiResponse({ status: 200, description: 'Liste du personnel' })
  async getAllPersonnel() {
    this.logger.log('Récupération de tout le personnel');
    return this.rhService.getAllPersonnel();
  }

  @Get('personnels/:id')
  @ApiOperation({ summary: 'Récupérer un personnel par ID' })
  @ApiResponse({ status: 200, description: 'Personnel trouvé' })
  async getPersonnelById(@Param('id') id: string) {
    this.logger.log(`Récupération du personnel ${id}`);
    return this.rhService.getPersonnelById(id);
  }

  @Put('personnels/:id')
  @ApiOperation({ summary: 'Mettre à jour un personnel' })
  @ApiResponse({ status: 200, description: 'Personnel mis à jour avec succès' })
  async updatePersonnel(@Param('id') id: string, @Body() dto: UpdatePersonnelDto) {
    this.logger.log(`Mise à jour du personnel ${id}`);
    return this.rhService.updatePersonnel(id, dto);
  }

  @Delete('personnels/:id')
  @ApiOperation({ summary: 'Désactiver un personnel' })
  @ApiResponse({ status: 200, description: 'Personnel désactivé avec succès' })
  async deletePersonnel(@Param('id') id: string) {
    this.logger.log(`Désactivation du personnel ${id}`);
    return this.rhService.deletePersonnel(id);
  }

  // -----------------------------
  // Statistiques RH
  // -----------------------------
  @Get('statistics')
  @ApiOperation({ summary: 'Récupérer les statistiques RH' })
  @ApiResponse({ status: 200, description: 'Statistiques RH' })
  async getStatistics() {
    this.logger.log('Récupération des statistiques RH');
    return this.rhService.getStatistics();
  }

  // -----------------------------
  // Alertes
  // -----------------------------
  // @Post('alerts')
  // @ApiOperation({ summary: 'Créer une alerte' })
  // @ApiResponse({ status: 201, description: 'Alerte créée' })
  // async createAlert(@Body() dto: CreateAlertDto) {
  //   this.logger.log(`Création d'une alerte: ${JSON.stringify(dto)}`);
  //   return this.rhService.createAlert(dto);
  // }

  // -----------------------------
  // Consulter toutes les demandes
  // -----------------------------
  @Get('demandes')
  @ApiOperation({ summary: 'Récupérer toutes les demandes de congé' })
  @ApiResponse({ status: 200, description: 'Liste des demandes' })
  async getDemandes() {
    this.logger.log('Récupération de toutes les demandes');
    return this.rhService.consulterDemandes();
  }
}
