import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Pusher from 'pusher';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private pusher: Pusher;

  constructor(private prisma: PrismaService) {
    // Initialiser Pusher avec les variables d'environnement
    this.pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.PUSHER_CLUSTER || 'eu',
      useTLS: true,
    });
  }

  /**
   * Crée une notification en base de données et l'envoie via Pusher
   * @param idPersonnel - ID du personnel destinataire
   * @param titre - Titre de la notification
   * @param message - Message de la notification
   * @param idDemande - ID de la demande associée (optionnel)
   * @returns La notification créée
   */
  async createNotification(
    idPersonnel: string,
    titre: string,
    message: string,
    idDemande?: string,
  ) {
    try {
      // Créer la notification en base de données
      const notification = await this.prisma.notification.create({
        data: {
          titre,
          message,
          id_personnel: idPersonnel,
          id_demande: idDemande || null,
        },
      });

      this.logger.log(`Notification créée en BD: ${notification.id_notification}`);

      // Envoyer la notification via Pusher à la personne spécifique
      // Le channel est basé sur l'ID du personnel pour cibler une personne précise
      const channelName = `user-${idPersonnel}`;
      
      await this.pusher.trigger(channelName, 'notification', {
        id_notification: notification.id_notification,
        titre: notification.titre,
        message: notification.message,
        is_lu: notification.is_lu,
        date_creation: notification.date_creation,
        id_demande: notification.id_demande,
      });

      this.logger.log(`Notification envoyée via Pusher au channel: ${channelName}`);

      return notification;
    } catch (error: any) {
      this.logger.error(`Erreur lors de la création/envoi de la notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Marque une notification comme lue
   * @param idNotification - ID de la notification
   * @param idPersonnel - ID du personnel (pour vérification)
   * @returns La notification mise à jour
   */
  async markAsRead(idNotification: string, idPersonnel: string) {
    try {
      // Vérifier que la notification appartient au personnel
      const notification = await this.prisma.notification.findFirst({
        where: {
          id_notification: idNotification,
          id_personnel: idPersonnel,
        },
      });

      if (!notification) {
        throw new Error('Notification non trouvée ou non autorisée');
      }

      // Marquer comme lue
      const updatedNotification = await this.prisma.notification.update({
        where: { id_notification: idNotification },
        data: { is_lu: true },
      });

      this.logger.log(`Notification ${idNotification} marquée comme lue`);

      return updatedNotification;
    } catch (error: any) {
      this.logger.error(`Erreur lors du marquage de la notification comme lue: ${error.message}`);
      throw error;
    }
  }

  /**
   * Récupère toutes les notifications d'un personnel
   * @param idPersonnel - ID du personnel
   * @param isLu - Filtrer par statut de lecture (optionnel)
   * @returns Liste des notifications
   */
  async getNotifications(idPersonnel: string, isLu?: boolean) {
    try {
      const where: any = { id_personnel: idPersonnel };
      if (isLu !== undefined) {
        where.is_lu = isLu;
      }

      const notifications = await this.prisma.notification.findMany({
        where,
        include: {
          demande: {
            include: {
              periodeConge: {
                include: { typeConge: true },
              },
            },
          },
        },
        orderBy: { date_creation: 'desc' },
      });

      return notifications;
    } catch (error: any) {
      this.logger.error(`Erreur lors de la récupération des notifications: ${error.message}`);
      throw error;
    }
  }

  /**
   * Récupère le nombre de notifications non lues d'un personnel
   * @param idPersonnel - ID du personnel
   * @returns Nombre de notifications non lues
   */
  async getUnreadCount(idPersonnel: string): Promise<number> {
    try {
      const count = await this.prisma.notification.count({
        where: {
          id_personnel: idPersonnel,
          is_lu: false,
        },
      });

      return count;
    } catch (error: any) {
      this.logger.error(`Erreur lors du comptage des notifications non lues: ${error.message}`);
      throw error;
    }
  }

  /**
   * Marque toutes les notifications d'un personnel comme lues
   * @param idPersonnel - ID du personnel
   * @returns Nombre de notifications mises à jour
   */
  async markAllAsRead(idPersonnel: string) {
    try {
      const result = await this.prisma.notification.updateMany({
        where: {
          id_personnel: idPersonnel,
          is_lu: false,
        },
        data: {
          is_lu: true,
        },
      });

      this.logger.log(`${result.count} notifications marquées comme lues pour le personnel ${idPersonnel}`);
      return result.count;
    } catch (error: any) {
      this.logger.error(`Erreur lors du marquage de toutes les notifications comme lues: ${error.message}`);
      throw error;
    }
  }
}

