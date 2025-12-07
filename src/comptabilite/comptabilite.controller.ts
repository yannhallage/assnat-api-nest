import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Logger,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ComptabiliteService } from './comptabilite.service';
import { CreateBulletinPaieDto, UpdateBulletinPaieDto, CreatePaieDto } from './dto/comptabilite.dto';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Comptabilité')
@ApiBearerAuth()
@Controller('comptabilite')
export class ComptabiliteController {
  private readonly logger = new Logger(ComptabiliteController.name);

  constructor(private readonly comptabiliteService: ComptabiliteService) {}

  // -----------------------------
  // Personnel
  // -----------------------------

  @Get('personnel')
  @ApiOperation({ summary: 'Récupérer tous les personnels' })
  @ApiResponse({ status: 200, description: 'Liste des personnels' })
  async getAllPersonnel() {
    this.logger.log('Récupération de tous les personnels');
    return this.comptabiliteService.getAllPersonnel();
  }

  @Get('personnel/:id')
  @ApiOperation({ summary: 'Récupérer un personnel par ID' })
  @ApiResponse({ status: 200, description: 'Personnel trouvé' })
  @ApiResponse({ status: 404, description: 'Personnel non trouvé' })
  async getPersonnelById(@Param('id') id: string) {
    this.logger.log(`Récupération du personnel ${id}`);
    return this.comptabiliteService.getPersonnelById(id);
  }

  // -----------------------------
  // Contrats
  // -----------------------------

  @Get('contrats')
  @ApiOperation({ summary: 'Récupérer tous les contrats' })
  @ApiResponse({ status: 200, description: 'Liste des contrats' })
  async getAllContrats() {
    this.logger.log('Récupération de tous les contrats');
    return this.comptabiliteService.getAllContrats();
  }

  @Get('contrats/:id')
  @ApiOperation({ summary: 'Récupérer un contrat par ID' })
  @ApiResponse({ status: 200, description: 'Contrat trouvé' })
  @ApiResponse({ status: 404, description: 'Contrat non trouvé' })
  async getContratById(@Param('id') id: string) {
    this.logger.log(`Récupération du contrat ${id}`);
    return this.comptabiliteService.getContratById(id);
  }

  @Get('personnel/:idPersonnel/contrats')
  @ApiOperation({ summary: 'Récupérer tous les contrats d\'un personnel' })
  @ApiResponse({ status: 200, description: 'Liste des contrats du personnel' })
  async getContratsByPersonnel(@Param('idPersonnel') idPersonnel: string) {
    this.logger.log(`Récupération des contrats du personnel ${idPersonnel}`);
    return this.comptabiliteService.getContratsByPersonnel(idPersonnel);
  }

  // -----------------------------
  // Paies
  // -----------------------------

  @Get('paies')
  @ApiOperation({ summary: 'Récupérer toutes les paies' })
  @ApiResponse({ status: 200, description: 'Liste des paies' })
  async getAllPaies() {
    this.logger.log('Récupération de toutes les paies');
    return this.comptabiliteService.getAllPaies();
  }

  @Post('paies')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
          cb(null, true);
        } else {
          cb(new BadRequestException('Seuls les fichiers PDF sont autorisés'), false);
        }
      },
    }),
  )
  @ApiOperation({ summary: 'Créer une nouvelle paie avec fichier PDF du bulletin' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['mois', 'annee', 'salaire_net', 'salaire_brut', 'id_personnel', 'file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Fichier PDF du bulletin de paie',
        },
        mois: {
          type: 'number',
          description: 'Mois de la paie (1-12)',
          example: 1,
        },
        annee: {
          type: 'number',
          description: 'Année de la paie',
          example: 2024,
        },
        salaire_net: {
          type: 'number',
          description: 'Salaire net',
          example: 3500.00,
        },
        salaire_brut: {
          type: 'number',
          description: 'Salaire brut',
          example: 4500.00,
        },
        primes: {
          type: 'number',
          description: 'Primes (optionnel)',
          example: 500.00,
        },
        deductions: {
          type: 'number',
          description: 'Déductions (optionnel)',
          example: 200.00,
        },
        id_personnel: {
          type: 'string',
          format: 'uuid',
          description: 'ID du personnel',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Paie créée avec succès' })
  @ApiResponse({ status: 404, description: 'Personnel non trouvé' })
  @ApiResponse({ status: 400, description: 'Données invalides ou paie déjà existante' })
  async createPaie(
    @Body() dto: CreatePaieDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Le fichier PDF du bulletin de paie est requis');
    }
    this.logger.log(`Création d'une paie pour le personnel ${dto.id_personnel}`);
    return this.comptabiliteService.createPaie(dto, file);
  }

  @Get('paies/:id')
  @ApiOperation({ summary: 'Récupérer une paie par ID' })
  @ApiResponse({ status: 200, description: 'Paie trouvée' })
  @ApiResponse({ status: 404, description: 'Paie non trouvée' })
  async getPaieById(@Param('id') id: string) {
    this.logger.log(`Récupération de la paie ${id}`);
    return this.comptabiliteService.getPaieById(id);
  }

  @Get('personnel/:idPersonnel/paies')
  @ApiOperation({ summary: 'Récupérer toutes les paies d\'un personnel' })
  @ApiResponse({ status: 200, description: 'Liste des paies du personnel' })
  async getPaiesByPersonnel(@Param('idPersonnel') idPersonnel: string) {
    this.logger.log(`Récupération des paies du personnel ${idPersonnel}`);
    return this.comptabiliteService.getPaiesByPersonnel(idPersonnel);
  }

  // -----------------------------
  // BulletinPaie - CRUD
  // -----------------------------

  @Post('bulletins-paie')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
          cb(null, true);
        } else {
          cb(new BadRequestException('Seuls les fichiers PDF sont autorisés'), false);
        }
      },
    }),
  )
  @ApiOperation({ summary: 'Créer un nouveau bulletin de paie avec fichier PDF' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['id_paie'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Fichier PDF du bulletin de paie (optionnel si url_pdf fourni)',
        },
        id_paie: {
          type: 'string',
          format: 'uuid',
          description: 'ID de la paie associée',
        },
        url_pdf: {
          type: 'string',
          format: 'uri',
          description: 'URL du PDF du bulletin de paie (optionnel si fichier fourni)',
        },
        note_rh: {
          type: 'string',
          description: 'Note du RH (optionnelle)',
        },
        date_emission: {
          type: 'string',
          format: 'date-time',
          description: 'Date d\'émission du bulletin (optionnelle)',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Bulletin de paie créé avec succès' })
  @ApiResponse({ status: 404, description: 'Paie non trouvée' })
  @ApiResponse({ status: 400, description: 'Données invalides ou fichier invalide' })
  async createBulletinPaie(
    @Body() dto: CreateBulletinPaieDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    this.logger.log('Création d\'un bulletin de paie');
    return this.comptabiliteService.createBulletinPaie(dto, file);
  }

  @Get('bulletins-paie')
  @ApiOperation({ summary: 'Récupérer tous les bulletins de paie' })
  @ApiResponse({ status: 200, description: 'Liste des bulletins de paie' })
  async getAllBulletinsPaie() {
    this.logger.log('Récupération de tous les bulletins de paie');
    return this.comptabiliteService.getAllBulletinsPaie();
  }

  @Get('bulletins-paie/:id')
  @ApiOperation({ summary: 'Récupérer un bulletin de paie par ID avec toutes les données associées' })
  @ApiResponse({ status: 200, description: 'Bulletin de paie trouvé' })
  @ApiResponse({ status: 404, description: 'Bulletin de paie non trouvé' })
  async getBulletinPaieById(@Param('id') id: string) {
    this.logger.log(`Récupération du bulletin de paie ${id}`);
    return this.comptabiliteService.getBulletinPaieById(id);
  }

  @Put('bulletins-paie/:id')
  @ApiOperation({ summary: 'Mettre à jour un bulletin de paie' })
  @ApiResponse({ status: 200, description: 'Bulletin de paie mis à jour avec succès' })
  @ApiResponse({ status: 404, description: 'Bulletin de paie non trouvé' })
  async updateBulletinPaie(@Param('id') id: string, @Body() dto: UpdateBulletinPaieDto) {
    this.logger.log(`Mise à jour du bulletin de paie ${id}`);
    return this.comptabiliteService.updateBulletinPaie(id, dto);
  }

  @Delete('bulletins-paie/:id')
  @ApiOperation({ summary: 'Supprimer un bulletin de paie' })
  @ApiResponse({ status: 200, description: 'Bulletin de paie supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Bulletin de paie non trouvé' })
  async deleteBulletinPaie(@Param('id') id: string) {
    this.logger.log(`Suppression du bulletin de paie ${id}`);
    return this.comptabiliteService.deleteBulletinPaie(id);
  }

  @Get('personnel/:idPersonnel/bulletins-paie')
  @ApiOperation({ summary: 'Récupérer tous les bulletins de paie d\'un personnel' })
  @ApiResponse({ status: 200, description: 'Liste des bulletins de paie du personnel' })
  async getBulletinsPaieByPersonnel(@Param('idPersonnel') idPersonnel: string) {
    this.logger.log(`Récupération des bulletins de paie du personnel ${idPersonnel}`);
    return this.comptabiliteService.getBulletinsPaieByPersonnel(idPersonnel);
  }
}

