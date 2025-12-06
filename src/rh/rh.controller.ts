import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RhService } from './rh.service';
import {
  CreateDirectionDto,
  CreateServiceDto,
  CreatePersonnelDto,
  UpdatePersonnelDto,
  CreateInteractionRhDto,
  CreateContratDto,
  UpdateContratDto,
  CreatePaieDto,
  UpdatePaieDto,
  CreatePersonnelDocumentDto,
  UpdatePersonnelDocumentDto,
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
    // console.log(dto);
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

  @Put('personnels/:id/archiver')
  @ApiOperation({ summary: 'Archiver un personnel' })
  @ApiResponse({ status: 200, description: 'Personnel archivé avec succès' })
  @ApiResponse({ status: 404, description: 'Personnel non trouvé' })
  async archiverPersonnel(@Param('id') id: string) {
    this.logger.log(`Archivage du personnel ${id}`);
    return this.rhService.archiverPersonnel(id);
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

  // -----------------------------
  // Interactions RH
  // -----------------------------
  @Post('interactions-rh')
  @ApiOperation({ summary: 'Créer une nouvelle interaction RH' })
  @ApiResponse({ status: 201, description: 'Interaction RH créée avec succès' })
  async createInteractionRh(@Body() dto: CreateInteractionRhDto) {
    this.logger.log(`Création d'une interaction RH: ${dto.titre}`);
    return this.rhService.createInteractionRh(dto);
  }

  @Get('interactions-rh')
  @ApiOperation({ summary: 'Récupérer toutes les interactions RH' })
  @ApiResponse({ status: 200, description: 'Liste des interactions RH' })
  async getAllInteractionsRh() {
    this.logger.log('Récupération de toutes les interactions RH');
    return this.rhService.getAllInteractionsRh();
  }

  @Delete('interactions-rh/:id')
  @ApiOperation({ summary: 'Supprimer une interaction RH' })
  @ApiResponse({ status: 200, description: 'Interaction RH supprimée avec succès' })
  @ApiResponse({ status: 404, description: 'Interaction RH non trouvée' })
  async deleteInteractionRh(@Param('id') id: string) {
    this.logger.log(`Suppression de l'interaction RH ${id}`);
    return this.rhService.deleteInteractionRh(id);
  }

  // -----------------------------
  // Contrats
  // -----------------------------
  @Post('contrats')
  @ApiOperation({ summary: 'Créer un nouveau contrat' })
  @ApiResponse({ status: 201, description: 'Contrat créé avec succès' })
  @ApiResponse({ status: 404, description: 'Personnel non trouvé' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async createContrat(@Body() dto: CreateContratDto) {
    this.logger.log(`Création d'un contrat pour le personnel ${dto.id_personnel}`);
    return this.rhService.createContrat(dto);
  }

  @Get('contrats')
  @ApiOperation({ summary: 'Récupérer tous les contrats' })
  @ApiResponse({ status: 200, description: 'Liste des contrats' })
  async getAllContrats() {
    this.logger.log('Récupération de tous les contrats');
    return this.rhService.getAllContrats();
  }

  @Get('contrats/:id')
  @ApiOperation({ summary: 'Récupérer un contrat par ID' })
  @ApiResponse({ status: 200, description: 'Contrat trouvé' })
  @ApiResponse({ status: 404, description: 'Contrat non trouvé' })
  async getContratById(@Param('id') id: string) {
    this.logger.log(`Récupération du contrat ${id}`);
    return this.rhService.getContratById(id);
  }

  @Get('personnels/:idPersonnel/contrats')
  @ApiOperation({ summary: 'Récupérer tous les contrats d\'un personnel' })
  @ApiResponse({ status: 200, description: 'Liste des contrats du personnel' })
  @ApiResponse({ status: 404, description: 'Personnel non trouvé' })
  async getContratsByPersonnel(@Param('idPersonnel') idPersonnel: string) {
    this.logger.log(`Récupération des contrats du personnel ${idPersonnel}`);
    return this.rhService.getContratsByPersonnel(idPersonnel);
  }

  @Put('contrats/:id')
  @ApiOperation({ summary: 'Mettre à jour un contrat' })
  @ApiResponse({ status: 200, description: 'Contrat mis à jour avec succès' })
  @ApiResponse({ status: 404, description: 'Contrat non trouvé' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async updateContrat(@Param('id') id: string, @Body() dto: UpdateContratDto) {
    this.logger.log(`Mise à jour du contrat ${id}`);
    return this.rhService.updateContrat(id, dto);
  }

  @Delete('contrats/:id')
  @ApiOperation({ summary: 'Supprimer un contrat' })
  @ApiResponse({ status: 200, description: 'Contrat supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Contrat non trouvé' })
  async deleteContrat(@Param('id') id: string) {
    this.logger.log(`Suppression du contrat ${id}`);
    return this.rhService.deleteContrat(id);
  }

  // -----------------------------
  // Paies
  // -----------------------------
  @Post('paies')
  @ApiOperation({ summary: 'Créer une nouvelle paie' })
  @ApiResponse({ status: 201, description: 'Paie créée avec succès' })
  @ApiResponse({ status: 404, description: 'Personnel non trouvé' })
  @ApiResponse({ status: 400, description: 'Données invalides ou paie déjà existante' })
  async createPaie(@Body() dto: CreatePaieDto) {
    this.logger.log(`Création d'une paie pour le personnel ${dto.id_personnel}`);
    return this.rhService.createPaie(dto);
  }

  @Get('paies')
  @ApiOperation({ summary: 'Récupérer toutes les paies' })
  @ApiResponse({ status: 200, description: 'Liste des paies' })
  async getAllPaies() {
    this.logger.log('Récupération de toutes les paies');
    return this.rhService.getAllPaies();
  }

  @Get('paies/:id')
  @ApiOperation({ summary: 'Récupérer une paie par ID' })
  @ApiResponse({ status: 200, description: 'Paie trouvée' })
  @ApiResponse({ status: 404, description: 'Paie non trouvée' })
  async getPaieById(@Param('id') id: string) {
    this.logger.log(`Récupération de la paie ${id}`);
    return this.rhService.getPaieById(id);
  }

  @Get('personnels/:idPersonnel/paies')
  @ApiOperation({ summary: 'Récupérer toutes les paies d\'un personnel' })
  @ApiResponse({ status: 200, description: 'Liste des paies du personnel' })
  @ApiResponse({ status: 404, description: 'Personnel non trouvé' })
  async getPaiesByPersonnel(@Param('idPersonnel') idPersonnel: string) {
    this.logger.log(`Récupération des paies du personnel ${idPersonnel}`);
    return this.rhService.getPaiesByPersonnel(idPersonnel);
  }

  @Get('paies/mois/:mois/annee/:annee')
  @ApiOperation({ summary: 'Récupérer toutes les paies d\'un mois et d\'une année' })
  @ApiResponse({ status: 200, description: 'Liste des paies pour le mois/année' })
  async getPaiesByMoisAnnee(@Param('mois') mois: string, @Param('annee') annee: string) {
    this.logger.log(`Récupération des paies pour ${mois}/${annee}`);
    return this.rhService.getPaiesByMoisAnnee(parseInt(mois), parseInt(annee));
  }

  @Put('paies/:id')
  @ApiOperation({ summary: 'Mettre à jour une paie' })
  @ApiResponse({ status: 200, description: 'Paie mise à jour avec succès' })
  @ApiResponse({ status: 404, description: 'Paie non trouvée' })
  @ApiResponse({ status: 400, description: 'Données invalides ou paie déjà existante' })
  async updatePaie(@Param('id') id: string, @Body() dto: UpdatePaieDto) {
    this.logger.log(`Mise à jour de la paie ${id}`);
    return this.rhService.updatePaie(id, dto);
  }

  @Delete('paies/:id')
  @ApiOperation({ summary: 'Supprimer une paie' })
  @ApiResponse({ status: 200, description: 'Paie supprimée avec succès' })
  @ApiResponse({ status: 404, description: 'Paie non trouvée' })
  async deletePaie(@Param('id') id: string) {
    this.logger.log(`Suppression de la paie ${id}`);
    return this.rhService.deletePaie(id);
  }

  // -----------------------------
  // Documents du Personnel
  // -----------------------------
  @Post('personnels/documents')
  @ApiOperation({ summary: 'Créer un nouveau document pour un personnel' })
  @ApiResponse({ status: 201, description: 'Document créé avec succès' })
  @ApiResponse({ status: 404, description: 'Personnel non trouvé' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async createPersonnelDocument(@Body() dto: CreatePersonnelDocumentDto) {
    this.logger.log(`Création d'un document pour le personnel ${dto.id_personnel}`);
    return this.rhService.createPersonnelDocument(dto);
  }

  @Get('personnels/documents')
  @ApiOperation({ summary: 'Récupérer tous les documents du personnel' })
  @ApiResponse({ status: 200, description: 'Liste des documents' })
  async getAllPersonnelDocuments() {
    this.logger.log('Récupération de tous les documents du personnel');
    return this.rhService.getAllPersonnelDocuments();
  }

  @Get('personnels/documents/:id')
  @ApiOperation({ summary: 'Récupérer un document par ID' })
  @ApiResponse({ status: 200, description: 'Document trouvé' })
  @ApiResponse({ status: 404, description: 'Document non trouvé' })
  async getPersonnelDocumentById(@Param('id') id: string) {
    this.logger.log(`Récupération du document ${id}`);
    return this.rhService.getPersonnelDocumentById(id);
  }

  @Get('personnels/:idPersonnel/documents')
  @ApiOperation({ summary: 'Récupérer tous les documents d\'un personnel' })
  @ApiResponse({ status: 200, description: 'Liste des documents du personnel' })
  @ApiResponse({ status: 404, description: 'Personnel non trouvé' })
  async getPersonnelDocumentsByPersonnel(@Param('idPersonnel') idPersonnel: string) {
    this.logger.log(`Récupération des documents du personnel ${idPersonnel}`);
    return this.rhService.getPersonnelDocumentsByPersonnel(idPersonnel);
  }

  @Get('personnels/:idPersonnel/documents/type/:type')
  @ApiOperation({ summary: 'Récupérer les documents d\'un personnel par type' })
  @ApiResponse({ status: 200, description: 'Liste des documents du type spécifié' })
  @ApiResponse({ status: 404, description: 'Personnel non trouvé' })
  @ApiResponse({ status: 400, description: 'Type de document invalide' })
  async getPersonnelDocumentsByType(@Param('idPersonnel') idPersonnel: string, @Param('type') type: string) {
    this.logger.log(`Récupération des documents de type ${type} pour le personnel ${idPersonnel}`);
    return this.rhService.getPersonnelDocumentsByType(idPersonnel, type);
  }

  @Put('personnels/documents/:id')
  @ApiOperation({ summary: 'Mettre à jour un document' })
  @ApiResponse({ status: 200, description: 'Document mis à jour avec succès' })
  @ApiResponse({ status: 404, description: 'Document non trouvé' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async updatePersonnelDocument(@Param('id') id: string, @Body() dto: UpdatePersonnelDocumentDto) {
    this.logger.log(`Mise à jour du document ${id}`);
    return this.rhService.updatePersonnelDocument(id, dto);
  }

  @Delete('personnels/documents/:id')
  @ApiOperation({ summary: 'Supprimer un document' })
  @ApiResponse({ status: 200, description: 'Document supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Document non trouvé' })
  async deletePersonnelDocument(@Param('id') id: string) {
    this.logger.log(`Suppression du document ${id}`);
    return this.rhService.deletePersonnelDocument(id);
  }
}
