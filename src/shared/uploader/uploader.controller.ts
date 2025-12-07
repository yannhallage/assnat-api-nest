import {
  Controller,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { UploaderService } from './uploader.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

@ApiTags('Uploader')
@ApiBearerAuth()
@Controller('uploader')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UploaderController {
  constructor(private readonly uploaderService: UploaderService) {}

  /**
   * Upload un fichier PDF sur GitHub
   */
  @Post('pdf')
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
  @ApiOperation({ summary: 'Uploader un fichier PDF sur GitHub' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Fichier PDF à uploader',
        },
        folder: {
          type: 'string',
          description: 'Dossier de destination (optionnel)',
          example: 'documents',
        },
      },
    },
  })
  @ApiQuery({
    name: 'folder',
    required: false,
    type: String,
    description: 'Dossier de destination sur GitHub (optionnel)',
  })
  @ApiResponse({
    status: 201,
    description: 'Fichier uploadé avec succès',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          example: 'https://raw.githubusercontent.com/owner/repo/main/documents/1234567890_document.pdf',
        },
        message: {
          type: 'string',
          example: 'Fichier uploadé avec succès',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Fichier invalide ou erreur lors de l\'upload' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async uploadPdf(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder?: string,
    @Request() req?: any,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    try {
      // const url = await this.uploaderService.uploadPdfToGitHub(file, folder);
      const url = await this.uploaderService.uploadPdfToGitHub(file);
      
      return {
        url,
        message: 'Fichier uploadé avec succès',
        fileName: file.originalname,
        size: file.size,
      };
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Erreur lors de l\'upload');
    }
  }

  /**
   * Supprime un fichier de GitHub
   */
  @Delete('pdf/:filePath')
  @ApiOperation({ summary: 'Supprimer un fichier PDF de GitHub' })
  @ApiResponse({
    status: 200,
    description: 'Fichier supprimé avec succès',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Fichier supprimé avec succès',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Erreur lors de la suppression' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async deletePdf(@Param('filePath') filePath: string) {
    // Décoder le chemin du fichier (peut contenir des slashes encodés)
    const decodedPath = decodeURIComponent(filePath);
    
    try {
      await this.uploaderService.deleteFileFromGitHub(decodedPath);
      
      return {
        message: 'Fichier supprimé avec succès',
        filePath: decodedPath,
      };
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Erreur lors de la suppression');
    }
  }
}

