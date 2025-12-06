import {
  Controller,
  Get,
  Put,
  Param,
  Query,
  UseGuards,
  Request,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(private readonly notificationService: NotificationService) {}

  /**
   * Récupère toutes les notifications de l'utilisateur connecté
   */
  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les notifications de l\'utilisateur' })
  @ApiQuery({ name: 'isLu', required: false, type: Boolean, description: 'Filtrer par statut de lecture' })
  @ApiResponse({ status: 200, description: 'Liste des notifications récupérée avec succès' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async getNotifications(@Request() req: any, @Query('isLu') isLu?: string) {
    const idPersonnel = req.user.id;
    
    // Convertir le paramètre query en boolean si fourni
    const isLuBoolean = isLu !== undefined ? isLu === 'true' : undefined;

    this.logger.log(`Récupération des notifications pour le personnel ${idPersonnel}`);
    return this.notificationService.getNotifications(idPersonnel, isLuBoolean);
  }

  /**
   * Récupère le nombre de notifications non lues
   */
  @Get('unread/count')
  @ApiOperation({ summary: 'Récupérer le nombre de notifications non lues' })
  @ApiResponse({ status: 200, description: 'Nombre de notifications non lues' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async getUnreadCount(@Request() req: any) {
    const idPersonnel = req.user.id;
    
    this.logger.log(`Récupération du nombre de notifications non lues pour le personnel ${idPersonnel}`);
    const count = await this.notificationService.getUnreadCount(idPersonnel);
    
    return { count, id_personnel: idPersonnel };
  }

  /**
   * Marque une notification comme lue
   */
  @Put(':id/read')
  @ApiOperation({ summary: 'Marquer une notification comme lue' })
  @ApiResponse({ status: 200, description: 'Notification marquée comme lue avec succès' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 404, description: 'Notification non trouvée' })
  async markAsRead(@Request() req: any, @Param('id') idNotification: string) {
    const idPersonnel = req.user.id;

    if (!idNotification) {
      throw new BadRequestException('ID de notification requis');
    }

    this.logger.log(`Marquage de la notification ${idNotification} comme lue pour le personnel ${idPersonnel}`);
    
    try {
      return await this.notificationService.markAsRead(idNotification, idPersonnel);
    } catch (error: any) {
      if (error.message.includes('non trouvée') || error.message.includes('non autorisée')) {
        throw new NotFoundException('Notification non trouvée ou non autorisée');
      }
      throw error;
    }
  }

  /**
   * Marque toutes les notifications comme lues
   */
  @Put('read-all')
  @ApiOperation({ summary: 'Marquer toutes les notifications comme lues' })
  @ApiResponse({ status: 200, description: 'Toutes les notifications marquées comme lues' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async markAllAsRead(@Request() req: any) {
    const idPersonnel = req.user.id;

    this.logger.log(`Marquage de toutes les notifications comme lues pour le personnel ${idPersonnel}`);
    const count = await this.notificationService.markAllAsRead(idPersonnel);
    
    return {
      message: 'Toutes les notifications ont été marquées comme lues',
      count,
      id_personnel: idPersonnel,
    };
  }
}

