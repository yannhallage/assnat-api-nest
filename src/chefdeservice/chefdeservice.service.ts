import { Injectable, NotFoundException, BadRequestException, Logger, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
// import { AuthService } from '../auth/auth.service';
import { ApproveDemandeDto, RejectDemandeDto } from './dto/chef.dto';
import type { Personnel } from '@prisma/client';
import * as bcrypt from 'bcryptjs'
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { EmailService } from '../shared/mail/mail.service';
import { NotificationService } from 'src/shared/notification/notification.service';
import { InvitePersonnelDto } from './dto/Inviter.dto';
import { CreateDiscussionDto } from 'src/user/dto/user.dto';

@Injectable()
export class ChefdeserviceService {
  private readonly logger = new Logger(ChefdeserviceService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private notificationService: NotificationService,
    // private authService: AuthService,
  ) { }

  async getServiceDemandes(id_chef: string) {
    this.logger.log(`Récupération des demandes du service pour le chef ${id_chef}`);

    // Récupérer le chef avec son service
    const chef = await this.prisma.personnel.findUnique({
      where: { id_personnel: id_chef },
      include: { service: true }, // Inclure le service pour récupérer id_service
    });

    if (!chef) throw new NotFoundException('Chef de service non trouvé');
    if (!chef.service) throw new NotFoundException('Service du chef introuvable');

    // Récupérer toutes les demandes du service du chef
    const demandes = await this.prisma.demande.findMany({
      where: {
        id_service: chef.service.id_service,
        statut_demande: { in: ['EN_ATTENTE', 'APPROUVEE', 'REFUSEE'] },
      },
      include: {
        personnel: true,
        periodeConge: { include: { typeConge: true } },
        discussions: { orderBy: { date_message: 'desc' } },
        ficheDeConge: true,
      },
      orderBy: { date_demande: 'desc' },
    });

    this.logger.log(`demandes récupérées`);
    return demandes;
  }

  async getHistoriqueDemandes(id_chef: string) {
    this.logger.log(`Récupération de l’historique des demandes pour le chef ${id_chef}`);

    const chef = await this.prisma.personnel.findUnique({
      where: { id_personnel: id_chef },
      include: { service: true },
    });

    if (!chef) {
      throw new NotFoundException('Chef de service non trouvé');
    }

    if (!chef.service) {
      throw new NotFoundException('Service du chef introuvable');
    }

    return this.prisma.demande.findMany({
      where: {
        id_service: chef.service.id_service,
        statut_demande: { in: ['TERMINEE', 'REFUSEE'] },
      },
      include: {
        personnel: true,
        periodeConge: { include: { typeConge: true } },
        discussions: { orderBy: { date_message: 'desc' } },
        ficheDeConge: true,
      },
      orderBy: { date_demande: 'desc' },
    });
  }

  async approveDemande(chef: Personnel, demandeId: string, approveDto: ApproveDemandeDto) {
    this.logger.log(`Approbation de la demande ${demandeId} par le chef ${chef.email_travail}`);

    // Utiliser une transaction pour garantir la cohérence des données
    return await this.prisma.$transaction(async (tx) => {
      const demande = await tx.demande.findFirst({
        where: {
          id_demande: demandeId,
          id_service: chef.id_service,
          statut_demande: 'EN_ATTENTE',
        },
        include: { 
          personnel: true,
          periodeConge: true,
        }        
      });

      if (!demande) {
        throw new NotFoundException('Demande non trouvée ou déjà traitée');
      }

      // Vérifier et réduire la disponibilité_day du personnel si une periodeConge est associée
      this.logger.log(`🔍 [DEBUG] Vérification période de congé - id_periodeconge: ${demande.id_periodeconge || 'NULL'}, periodeConge: ${demande.periodeConge ? 'existe' : 'null'}, nb_jour: ${demande.periodeConge?.nb_jour || 'N/A'}, personnel: ${demande.personnel ? 'existe' : 'null'}, id_personnel: ${demande.id_personnel}`);
      
      // Vérifier si une période de congé est associée (soit via la relation, soit via l'ID)
      if (demande.id_periodeconge) {
        this.logger.log(`✅ [DEBUG] Condition remplie - id_periodeconge existe et personnel existe`);
        
        // Si la relation n'est pas chargée, la charger
        let periodeConge = demande.periodeConge;
        if (!periodeConge && demande.id_periodeconge) {
          this.logger.log(`📥 [DEBUG] Chargement de la période de congé depuis la base de données`);
          periodeConge = await tx.periodeConge.findUnique({
            where: { id_periodeconge: demande.id_periodeconge },
          });
          this.logger.log(`📥 [DEBUG] Période de congé chargée - nb_jour: ${periodeConge?.nb_jour || 'N/A'}`);
        }
        
        if (periodeConge && periodeConge.nb_jour > 0) {
          const nbJour = periodeConge.nb_jour;
          const disponibiliteActuelle = demande.personnel.disponibilité_day;

          this.logger.log(`💰 [REDUCTION] Disponibilité actuelle: ${disponibiliteActuelle}, Jours demandés: ${nbJour}`);

          // Vérifier que l'utilisateur a assez de jours disponibles
          if (disponibiliteActuelle < nbJour) {
            throw new BadRequestException(
              `Jours disponibles insuffisants. Disponibilité actuelle: ${disponibiliteActuelle} jours, demandés: ${nbJour} jours`
            );
          }

          const nouvelleDisponibilite = disponibiliteActuelle - nbJour;
          
          this.logger.log(`💰 [REDUCTION] Mise à jour - Ancienne: ${disponibiliteActuelle}, Nouvelle: ${nouvelleDisponibilite}`);
          
          // Mettre à jour la disponibilité dans la même transaction
          const personnelUpdated = await tx.personnel.update({
            where: { id_personnel: demande.id_personnel },
            data: {
              disponibilité_day: nouvelleDisponibilite,
            },
          });
          
          // Vérifier que la mise à jour a bien fonctionné
          if (personnelUpdated.disponibilité_day !== nouvelleDisponibilite) {
            this.logger.error(`❌ ERREUR: La disponibilité n'a pas été mise à jour correctement. Attendu: ${nouvelleDisponibilite}, Obtenu: ${personnelUpdated.disponibilité_day}`);
            throw new InternalServerErrorException('Erreur lors de la mise à jour de la disponibilité');
          }
          
          this.logger.log(`✅ [SUCCESS] Disponibilité réduite de ${nbJour} jours pour le personnel ${demande.id_personnel}. Nouvelle disponibilité: ${personnelUpdated.disponibilité_day}`);
        } else {
          this.logger.warn(`⚠️ [WARNING] Pas de réduction - periodeConge invalide ou nb_jour <= 0 (periodeConge: ${!!periodeConge}, nb_jour: ${periodeConge?.nb_jour || 'N/A'})`);
        }
      } else {
        this.logger.warn(`⚠️ [WARNING] Pas de réduction - id_periodeconge: ${demande.id_periodeconge || 'NULL'}, personnel: ${!!demande.personnel}`);
      }

      // Approuver la demande
      const updatedDemande = await tx.demande.update({
        where: { id_demande: demandeId },
        data: {
          statut_demande: 'APPROUVEE',
        },
      });

      // Ajouter un commentaire si fourni (dans la transaction)
      if (approveDto.commentaire) {
        await tx.discussion.create({
          data: {
            message: `[APPROUVÉE] ${approveDto.commentaire}`,
            id_demande: demandeId,
          },
        });
      }

      // Retourner la demande mise à jour avec les infos pour l'email et la notification
      return { 
        updatedDemande, 
        emailPersonnel: demande.personnel?.email_personnel,
        idPersonnel: demande.personnel?.id_personnel,
        nomPersonnel: demande.personnel?.nom_personnel,
        prenomPersonnel: demande.personnel?.prenom_personnel,
      };
    }).then(async ({ updatedDemande, emailPersonnel, idPersonnel, nomPersonnel, prenomPersonnel }) => {
      // Envoyer une notification par email (après la transaction pour éviter les erreurs d'email de bloquer la transaction)
      if (emailPersonnel) {
        try {
          await this.emailService.sendNotificationEmail(
            emailPersonnel,
            'Demande de congé approuvée',
            `Votre demande de congé a été approuvée par votre chef de service.${approveDto.commentaire ? `<br><br>Commentaire: ${approveDto.commentaire}` : ''}`,
          );
        } catch (error) {
          this.logger.error(`Erreur lors de l'envoi de l'email de notification: ${error.message}`);
          // Ne pas faire échouer l'opération si l'email échoue
        }
      }

      // Créer une notification en base de données et l'envoyer via Pusher
      if (idPersonnel) {
        try {
          await this.notificationService.createNotification(
            idPersonnel,
            'Demande de congé approuvée',
            `Votre demande de congé a été approuvée par votre chef de service.${approveDto.commentaire ? ` Commentaire: ${approveDto.commentaire}` : ''}`,
            updatedDemande.id_demande,
          );
          this.logger.log(`Notification créée pour le personnel: ${idPersonnel}`);
        } catch (error: any) {
          this.logger.error(`Erreur lors de la création de la notification: ${error.message}`);
          // Ne pas faire échouer l'opération si la notification échoue
        }
      }

      this.logger.log(`Demande ${demandeId} approuvée avec succès`);
      return updatedDemande;
    });
  }

  async rejectDemande(chef: Personnel, demandeId: string, rejectDto: RejectDemandeDto) {
    this.logger.log(`Refus de la demande ${demandeId} par le chef ${chef.email_travail}`);

    const demande = await this.prisma.demande.findFirst({
      where: {
        id_demande: demandeId,
        id_service: chef.id_service,
        statut_demande: 'EN_ATTENTE',
      },
      include: { personnel: true },
    });

    if (!demande) {
      throw new NotFoundException('Demande non trouvée ou déjà traitée');
    }

    const updatedDemande = await this.prisma.demande.update({
      where: { id_demande: demandeId },
      data: {
        statut_demande: 'REFUSEE',
      },
    });

    // Ajouter le motif de refus comme discussion
    await this.prisma.discussion.create({
      data: {
        message: `[REFUSÉE] Motif: ${rejectDto.motif}`,
        id_demande: demandeId,
      },
    });

    // Envoyer une notification par email
    if (demande.personnel.email_personnel) {
      try {
        await this.emailService.sendNotificationEmail(
          demande.personnel.email_personnel,
          'Demande de congé refusée',
          `Votre demande de congé a été refusée par votre chef de service.<br><br>Motif: ${rejectDto.motif}`,
        );
      } catch (error) {
        this.logger.error(`Erreur lors de l'envoi de l'email de notification: ${error.message}`);
      }
    }

    // Créer une notification en base de données et l'envoyer via Pusher
    try {
      await this.notificationService.createNotification(
        demande.personnel.id_personnel,
        'Demande de congé refusée',
        `Votre demande de congé a été refusée par votre chef de service. Motif: ${rejectDto.motif}`,
        demandeId,
      );
      this.logger.log(`Notification créée pour le personnel: ${demande.personnel.id_personnel}`);
    } catch (error: any) {
      this.logger.error(`Erreur lors de la création de la notification: ${error.message}`);
      // Ne pas faire échouer l'opération si la notification échoue
    }

    this.logger.log(`Demande ${demandeId} refusée avec succès`);
    return updatedDemande;
  }

  async revokeDemande(chef: Personnel, demandeId: string) {
    this.logger.log(`Révocation de la demande ${demandeId} par le chef ${chef.email_travail}`);

    // Utiliser une transaction pour garantir la cohérence des données
    return await this.prisma.$transaction(async (tx) => {
      const demande = await tx.demande.findFirst({
        where: {
          id_demande: demandeId,
          id_service: chef.id_service,
          statut_demande: 'APPROUVEE',
        },
        include: { 
          personnel: true,
          periodeConge: true,
        },
      });

      if (!demande) {
        throw new NotFoundException('Demande non trouvée ou non approuvée');
      }

      // Remettre les jours de congé au personnel si une periodeConge est associée
      if (demande.id_periodeconge) {
        // Si la relation n'est pas chargée, la charger
        let periodeConge = demande.periodeConge;
        if (!periodeConge && demande.id_periodeconge) {
          periodeConge = await tx.periodeConge.findUnique({
            where: { id_periodeconge: demande.id_periodeconge },
          });
        }
        
        if (periodeConge && periodeConge.nb_jour > 0) {
          const nbJour = periodeConge.nb_jour;
          const disponibiliteActuelle = demande.personnel.disponibilité_day;
          const nouvelleDisponibilite = disponibiliteActuelle + nbJour;

          this.logger.log(`[RESTAURATION] Disponibilité actuelle: ${disponibiliteActuelle}, Jours à remettre: ${nbJour}, Nouvelle disponibilité: ${nouvelleDisponibilite}`);

          // Mettre à jour la disponibilité dans la même transaction
          await tx.personnel.update({
            where: { id_personnel: demande.id_personnel },
            data: {
              disponibilité_day: nouvelleDisponibilite,
            },
          });

          this.logger.log(`[SUCCESS] Disponibilité restaurée de ${nbJour} jours pour le personnel ${demande.id_personnel}`);
        }
      }

      // Révoquer la demande
      const updatedDemande = await tx.demande.update({
        where: { id_demande: demandeId },
        data: {
          statut_demande: 'REFUSEE',
        },
      });

      // Ajouter un commentaire de révocation
      await tx.discussion.create({
        data: {
          message: '[RÉVOQUÉE] Cette demande a été révoquée par le chef de service',
          id_demande: demandeId,
        },
      });

      // Retourner la demande mise à jour avec les infos pour l'email et la notification
      return { 
        updatedDemande, 
        emailPersonnel: demande.personnel?.email_personnel,
        idPersonnel: demande.personnel?.id_personnel,
      };
    }).then(async ({ updatedDemande, emailPersonnel, idPersonnel }) => {
      // Envoyer une notification par email (après la transaction pour éviter les erreurs d'email de bloquer la transaction)
      if (emailPersonnel) {
        try {
          await this.emailService.sendNotificationEmail(
            emailPersonnel,
            'Demande de congé révoquée',
            'Votre demande de congé approuvée a été révoquée par votre chef de service.',
          );
        } catch (error) {
          this.logger.error(`Erreur lors de l'envoi de l'email de notification: ${error.message}`);
          // Ne pas faire échouer l'opération si l'email échoue
        }
      }

      // Créer une notification en base de données et l'envoyer via Pusher
      if (idPersonnel) {
        try {
          await this.notificationService.createNotification(
            idPersonnel,
            'Demande de congé révoquée',
            'Votre demande de congé approuvée a été révoquée par votre chef de service.',
            updatedDemande.id_demande,
          );
          this.logger.log(`Notification créée pour le personnel: ${idPersonnel}`);
        } catch (error: any) {
          this.logger.error(`Erreur lors de la création de la notification: ${error.message}`);
          // Ne pas faire échouer l'opération si la notification échoue
        }
      }

      this.logger.log(`Demande ${demandeId} révoquée avec succès`);
      return updatedDemande;
    });
  }

  async deleteDemande(chef: Personnel, demandeId: string) {
    this.logger.log(`Suppression de la demande ${demandeId} par le chef ${chef.email_travail}`);

    const demande = await this.prisma.demande.findFirst({
      where: {
        id_demande: demandeId,
        id_service: chef.id_service,
      },
    });

    if (!demande) {
      throw new NotFoundException('Demande non trouvée');
    }

    // Supprimer les discussions associées
    await this.prisma.discussion.deleteMany({
      where: { id_demande: demandeId },
    });

    // Supprimer la fiche de congé si elle existe
    await this.prisma.ficheDeConge.deleteMany({
      where: { id_demande: demandeId },
    });

    // Supprimer la demande
    await this.prisma.demande.delete({
      where: { id_demande: demandeId },
    });

    this.logger.log(`Demande ${demandeId} supprimée avec succès`);
    return { message: 'Demande supprimée avec succès' };
  }

  async invitePersonnel(dto: InvitePersonnelDto) {
    if (!dto?.email_personnel) {
      throw new BadRequestException('Email du personnel invalide pour invitation');
    }

    // Vérifier si le personnel existe déjà
    const existing = await this.prisma.personnel.findFirst({
      where: { email_travail: dto.email_personnel },
    });

    // Générer un mot de passe temporaire
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    let personnel;

    if (existing) {
      if (existing.is_active) {
        // Le personnel existe et est actif → on arrête
        throw new BadRequestException('Le personnel existe déjà et est actif');
      } else {
        // Le personnel existe mais est inactif → mise à jour du mot de passe et activation
        personnel = await this.prisma.personnel.update({
          where: { id_personnel: existing.id_personnel },
          data: {
            password: hashedPassword,
            is_active: true,
          },
        });
      }
    }

    // Envoyer l'email d'invitation
    try {
      await this.emailService.sendInvitationEmail(
        dto.email_personnel,
        tempPassword,
        dto.nom_personnel,
        dto.prenom_personnel
      );
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de l'email d'invitation: ${error.message}`);
      throw error;
    }

    // Créer une notification pour le personnel invité (si le personnel existe)
    if (personnel) {
      try {
        await this.notificationService.createNotification(
          personnel.id_personnel,
          'Invitation au système de gestion des congés',
          `Vous avez été invité à rejoindre le système de gestion des congés. Votre mot de passe temporaire vous a été envoyé par email.`,
        );
        this.logger.log(`Notification créée pour le personnel invité: ${personnel.id_personnel}`);
      } catch (error: any) {
        this.logger.error(`Erreur lors de la création de la notification: ${error.message}`);
        // Ne pas faire échouer l'opération si la notification échoue
      }
    }

    return { message: 'Invitation envoyée', personnelId: personnel.id_personnel };
  }


  async getServicePersonnel(serviceId: string) {
    if (!serviceId) {
      this.logger.warn(`Service ID manquant`);
      throw new BadRequestException('L’ID du service est requis');
    }

    this.logger.log(`Récupération du personnel du service ${serviceId}`);

    try {
      const personnelList = await this.prisma.personnel.findMany({
        where: {
          id_service: serviceId,
          // is_active: true || false,
        },
        include: {
          service: true,
          _count: {
            select: {
              demandes: true,
              fichesConge: true,
              demandesEnCoursChef: true,
            },
          },
        },
        orderBy: { nom_personnel: 'asc' },
      });

      if (!personnelList.length) {
        this.logger.log(`Aucun personnel trouvé pour le service ${serviceId}`);
      }

      return personnelList;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération du personnel du service ${serviceId}: ${error.message}`,
      );
      throw new InternalServerErrorException('Impossible de récupérer le personnel du service');
    }
  }

  async getDiscussionsByDemande(demandeId: string) {
    this.logger.log(`Récupération des discussions pour la demande ${demandeId} par le chef }`);

    // Récupérer le chef avec son service
    // const chef = await this.prisma.personnel.findUnique({
    //   where: { id_personnel: id_chef },
    //   include: { service: true },
    // });

    // if (!chef) throw new NotFoundException('Chef de service non trouvé');
    // if (!chef.service) throw new NotFoundException('Service du chef introuvable');

    // Vérifier que la demande existe et appartient au service du chef
    const demande = await this.prisma.demande.findFirst({
      where: {
        id_demande: demandeId,
        // id_service: chef.service.id_service,
      },
    });

    if (!demande) {
      throw new NotFoundException('Demande non trouvée ou non autorisée');
    }

    // Récupérer les discussions liées à la demande, triées par date croissante
    const discussions = await this.prisma.discussion.findMany({
      where: { id_demande: demandeId },
      orderBy: { date_message: 'asc' },
    });

    this.logger.log(`Nombre de discussions récupérées: ${discussions.length}`);
    return discussions;
  }

  async addDiscussionToDemande(id_chef: string, demandeId: string, dto: CreateDiscussionDto) {
      this.logger.log(`Ajout d'une discussion à la demande ${demandeId}`);
  
      const demande = await this.prisma.demande.findFirst({
        where: { id_demande: demandeId },
      });
      if (!demande) throw new NotFoundException('Demande non trouvée ou non autorisée');
  
      const discussion = await this.prisma.discussion.create({
        data: { 
          message: dto.message, 
          heure_message: dto.heure_message, 
          auteur_message: dto.auteur_message,
          id_demande: demandeId 
        },
      });
  
      this.logger.log(`Discussion ajoutée: ${discussion.id_discussion}`);
      return discussion;
    }

  // -----------------------------
  // Interactions RH
  // -----------------------------
  async getAllInteractionsRh() {
    this.logger.log('Récupération de toutes les interactions RH');
    return this.prisma.interactionRh.findMany({
      orderBy: { date: 'desc' },
    });
  }
}
