import { Injectable, NotFoundException, BadRequestException, Logger, ForbiddenException } from '@nestjs/common';
// import { AuthService } from '../auth/auth.service';
import { ApproveDemandeDto, RejectDemandeDto, InvitePersonnelDto } from './dto/chef.dto';
import type { Personnel } from '@prisma/client';// import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { EmailService } from 'src/shared/mail/mail.service';

@Injectable()
export class ChefdeserviceService {
  private readonly logger = new Logger(ChefdeserviceService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    // private authService: AuthService,
  ) { }

  async getServiceDemandes(chef: Personnel) {
    this.logger.log(`Récupération des demandes du service pour le chef ${chef.email_travail}`);

    const demandes = await this.prisma.demande.findMany({
      where: {
        id_service: chef.id_service,
        statut_demande: { in: ['EN_ATTENTE', 'APPROUVEE', 'REFUSEE'] },
      },
      include: {
        personnel: true,
        periodeConge: {
          include: { typeConge: true },
        },
        discussions: {
          orderBy: { date_message: 'desc' },
        },
        ficheDeConge: true,
      },
      orderBy: { date_demande: 'desc' },
    });

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

  // async invitePersonnel(chef: Personnel, inviteDto: InvitePersonnelDto) {
  //   this.logger.log(`Invitation d'un nouveau personnel par le chef ${chef.email_travail}`);

  //   // Vérifier que l'email n'existe pas déjà
  //   const existingPersonnel = await this.prisma.personnel.findFirst({
  //     where: {
  //       OR: [
  //         { email_travail: inviteDto.email_travail },
  //         { email_personnel: inviteDto.email_personnel },
  //       ],
  //     },
  //   });

  //   if (existingPersonnel) {
  //     throw new BadRequestException('Un personnel avec cet email existe déjà');
  //   }

  //   // Générer un mot de passe temporaire
  //   const temporaryPassword = await this.authService.generateTemporaryPassword();

  //   // Créer le personnel
  //   const newPersonnel = await this.prisma.personnel.create({
  //     data: {
  //       nom_personnel: inviteDto.nom_personnel,
  //       prenom_personnel: inviteDto.prenom_personnel,
  //       email_travail: inviteDto.email_travail,
  //       email_personnel: inviteDto.email_personnel,
  //       password: await bcrypt.hash(temporaryPassword, 10),
  //       matricule_personnel: inviteDto.matricule_personnel,
  //       telephone_travail: inviteDto.telephone_travail,
  //       telephone_personnel: inviteDto.telephone_personnel,
  //       type_personnel: inviteDto.type_personnel,
  //       role_personnel: RolePersonnel.EMPLOYE,
  //       id_service: chef.id_service,
  //     },
  //   });

  //   // Envoyer l'email d'invitation
  //   await this.emailService.sendInvitationEmail(
  //     inviteDto.email_travail,
  //     temporaryPassword,
  //     inviteDto.nom_personnel,
  //     inviteDto.prenom_personnel,
  //   );

  //   // Mettre à jour le nombre de personnel du service
  //   await this.prisma.service.update({
  //     where: { id_service: chef.id_service },
  //     data: {
  //       nb_personnel: {
  //         increment: 1,
  //       },
  //     },
  //   });

  //   this.logger.log(`Personnel invité avec succès: ${newPersonnel.email_travail}`);
  //   return {
  //     message: 'Personnel invité avec succès',
  //     personnel: {
  //       id: newPersonnel.id_personnel,
  //       nom: newPersonnel.nom_personnel,
  //       prenom: newPersonnel.prenom_personnel,
  //       email: newPersonnel.email_travail,
  //     },
  //   };
  // }

  async getServicePersonnel(chef: Personnel) {
    this.logger.log(`Récupération du personnel du service pour le chef ${chef.email_travail}`);

    const personnel = await this.prisma.personnel.findMany({
      where: {
        id_service: chef.id_service,
        is_active: true,
      },
      include: {
        service: true,
        _count: {
          select: {
            demandes: true,
            fichesConge: true,
          },
        },
      },
      orderBy: { nom_personnel: 'asc' },
    });

    return personnel;
  }
}
