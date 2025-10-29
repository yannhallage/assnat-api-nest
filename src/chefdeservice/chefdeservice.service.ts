import { Injectable, NotFoundException, BadRequestException, Logger, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
// import { AuthService } from '../auth/auth.service';
import { ApproveDemandeDto, RejectDemandeDto } from './dto/chef.dto';
import type { Personnel } from '@prisma/client';
import * as bcrypt from 'bcryptjs'
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { EmailService } from 'src/shared/mail/mail.service';
import { InvitePersonnelDto } from './dto/Inviter.dto';
import { CreateDiscussionDto } from 'src/user/dto/user.dto';

@Injectable()
export class ChefdeserviceService {
  private readonly logger = new Logger(ChefdeserviceService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
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

  async approveDemande(chef: Personnel, demandeId: string, approveDto: ApproveDemandeDto) {
    this.logger.log(`Approbation de la demande ${demandeId} par le chef ${chef.email_travail}`);

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
        statut_demande: 'APPROUVEE',
      },
    });

    // Ajouter un commentaire si fourni
    if (approveDto.commentaire) {
      await this.prisma.discussion.create({
        data: {
          message: `[APPROUVÉE] ${approveDto.commentaire}`,
          id_demande: demandeId,
        },
      });
    }

    // Envoyer une notification par email
    if (demande.personnel.email_personnel) {
      await this.emailService.sendNotificationEmail(
        demande.personnel.email_personnel,
        'Demande de congé approuvée',
        `Votre demande de congé a été approuvée par votre chef de service.${approveDto.commentaire ? `<br><br>Commentaire: ${approveDto.commentaire}` : ''}`,
      );
    }

    this.logger.log(`Demande ${demandeId} approuvée avec succès`);
    return updatedDemande;
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
      await this.emailService.sendNotificationEmail(
        demande.personnel.email_personnel,
        'Demande de congé refusée',
        `Votre demande de congé a été refusée par votre chef de service.<br><br>Motif: ${rejectDto.motif}`,
      );
    }

    this.logger.log(`Demande ${demandeId} refusée avec succès`);
    return updatedDemande;
  }

  async revokeDemande(chef: Personnel, demandeId: string) {
    this.logger.log(`Révocation de la demande ${demandeId} par le chef ${chef.email_travail}`);

    const demande = await this.prisma.demande.findFirst({
      where: {
        id_demande: demandeId,
        id_service: chef.id_service,
        statut_demande: 'APPROUVEE',
      },
      include: { personnel: true },
    });

    if (!demande) {
      throw new NotFoundException('Demande non trouvée ou non approuvée');
    }

    const updatedDemande = await this.prisma.demande.update({
      where: { id_demande: demandeId },
      data: {
        statut_demande: 'REFUSEE',
      },
    });

    // Ajouter un commentaire de révocation
    await this.prisma.discussion.create({
      data: {
        message: '[RÉVOQUÉE] Cette demande a été révoquée par le chef de service',
        id_demande: demandeId,
      },
    });

    // Envoyer une notification par email
    if (demande.personnel.email_personnel) {
      await this.emailService.sendNotificationEmail(
        demande.personnel.email_personnel,
        'Demande de congé révoquée',
        'Votre demande de congé approuvée a été révoquée par votre chef de service.',
      );
    }

    this.logger.log(`Demande ${demandeId} révoquée avec succès`);
    return updatedDemande;
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

    // Envoyer l’email d’invitation
    await this.emailService.sendInvitationEmail(
      dto.email_personnel,
      tempPassword,
      dto.nom_personnel,
      dto.prenom_personnel
    );

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

  async addDiscussionToDemande(id_chef: string, demandeId: string, dto: CreateDiscussionDto) {
      this.logger.log(`Ajout d'une discussion à la demande ${demandeId}`);
  
      const demande = await this.prisma.demande.findFirst({
        where: { id_demande: demandeId },
      });
      if (!demande) throw new NotFoundException('Demande non trouvée ou non autorisée');
  
      const discussion = await this.prisma.discussion.create({
        data: { message: dto.message, heure_message: dto.heure_message, id_demande: demandeId },
      });
  
      this.logger.log(`Discussion ajoutée: ${discussion.id_discussion}`);
      return discussion;
    }
}
