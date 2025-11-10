import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../shared/prisma/prisma.service';
import { CreateDirectionDto } from './dto/create-direction.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { CreatePersonnelDto } from './dto/create-personnel.dto';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdatePersonnelDto } from './dto/update-personnel.dto';
import { EmailService } from 'src/shared/mail/mail.service';
import { CreateTypeCongeDto } from './dto/create-type-conge.dto';

@Injectable()
export class RhService {
  private readonly logger = new Logger(RhService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) { }

  // -----------------------------
  // Directions
  // -----------------------------
  async createDirection(dto: CreateDirectionDto) {
    return this.prisma.direction.create({ data: dto });
  }

  async getAllDirections() {
    return this.prisma.direction.findMany({
      include: { services: true },
    });
  }

  async getDirectionById(id: string) {
    const direction = await this.prisma.direction.findUnique({
      where: { id_direction: id },
      include: { services: true },
    });
    if (!direction) throw new NotFoundException('Direction non trouvée');
    return direction;
  }

  // -----------------------------
  // Services
  // -----------------------------
  async createService(dto: CreateServiceDto) {
    return this.prisma.service.create({ data: dto });
  }

  async getAllServices() {
    return this.prisma.service.findMany({ include: { personnels: true } });
  }

  async getServiceById(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id_service: id },
      include: { personnels: true, direction: true },
    });
    if (!service) throw new NotFoundException('Service non trouvé');
    return service;
  }

  // -----------------------------
  // Créer un personnel et envoyer un email de notification
  // -----------------------------
  /**
   * Crée un nouveau personnel dans le système.
   * Le mot de passe est hashé avant l'enregistrement.
   * Un email de bienvenue est envoyé.
   */
  async createPersonnel(dto: CreatePersonnelDto) {
    const prisma = this.prisma;

    return await prisma.$transaction(async (tx) => {
      try {
        // 1️⃣ Détermination du mot de passe
        let passwordToUse = dto.password;

        if (dto.role_personnel === 'CHEF_SERVICE') {
          passwordToUse = Math.random().toString(36).slice(-8); // 8 caractères aléatoires
          this.logger.log(`🔐 Mot de passe auto-généré pour le chef de service`);
        }

        if (!passwordToUse) {
          throw new BadRequestException('Le mot de passe est requis pour ce rôle');
        }

        const hashedPassword = await bcrypt.hash(passwordToUse, 10);

        // 2️⃣ Création du personnel
        const personnel = await tx.personnel.create({
          data: {
            ...dto,
            password: hashedPassword,
            is_active: dto.role_personnel === 'CHEF_SERVICE',
          },
          include: { service: true },
        });

        this.logger.log(`✅ Personnel créé : ${personnel.prenom_personnel} ${personnel.nom_personnel}`);

        // 3️⃣ Si CHEF_SERVICE, mettre à jour la table service
        if (dto.role_personnel === 'CHEF_SERVICE') {
          await tx.service.update({
            where: { id_service: dto.id_service },
            data: { id_chefdeservice: personnel.id_personnel },
          });
          this.logger.log(`🔄 Service mis à jour avec id_chefdeservice = ${personnel.id_personnel}`);
        }

        // 4️⃣ Préparation du contenu email
        let subject: string;
        let message: string;
        const recipient = personnel.email_personnel!;

        if (dto.role_personnel === 'CHEF_SERVICE') {
          subject = 'Création de votre compte Chef de Service';
          message = `
          <p>Bonjour ${personnel.prenom_personnel} ${personnel.nom_personnel},</p>
          <p>Votre compte Chef de Service a été créé avec succès.</p>
          <p>Voici vos identifiants de connexion :</p>
          <ul>
            <li><strong>Email :</strong> ${personnel.email_personnel}</li>
            <li><strong>Mot de passe :</strong> ${passwordToUse}</li>
          </ul>
          <p>Veuillez modifier votre mot de passe après la première connexion.</p>
          <p>Cordialement,<br>L’équipe RH</p>
        `;
        
        } else {
          subject = 'Bienvenue dans le système de gestion des congés';
          message = `
          <p>Bonjour ${personnel.prenom_personnel} ${personnel.nom_personnel},</p>
          <p>Votre compte a été créé avec succès dans le système.</p>
          <p>Vous pouvez maintenant accéder à votre interface dédiée.</p>
          <p>Cordialement,<br>L’équipe RH</p>
        `;
        }

        // 5️⃣ Envoi d’email
        try {
          await this.emailService.sendNotificationEmail(recipient, subject, message);
          this.logger.log(`📩 Email envoyé à ${recipient}`);
        } catch (emailError) {
          this.logger.error(`❌ Erreur lors de l’envoi d’email: ${emailError.message}`);
          throw new Error('Échec lors de l’envoi de l’email');
        }

        // 6️⃣ Retour succès
        return { success: true, id: personnel.id_personnel };
      } catch (error) {
        this.logger.error(`🚨 Erreur lors de la création du personnel: ${error.message}`);
        throw new BadRequestException('Impossible de créer le personnel');
      }
    });
  }


  async getAllPersonnel() {
    return this.prisma.personnel.findMany({ include: { service: true } });
  }

  async getPersonnelById(id: string) {
    const personnel = await this.prisma.personnel.findUnique({
      where: { id_personnel: id },
      include: {
        service: true,
        demandes: true
      },
    });

    if (!personnel) {
      throw new NotFoundException('Personnel non trouvé');
    }

    return personnel;
  }


  async updatePersonnel(id: string, dto: UpdatePersonnelDto) {
    return this.prisma.personnel.update({
      where: { id_personnel: id },
      data: dto,
    });
  }

  async deletePersonnel(id: string) {
    return this.prisma.personnel.update({
      where: { id_personnel: id },
      data: { is_active: false },
    });
  }

  // -----------------------------
  // Statistiques RH
  // -----------------------------
  async getStatistics() {
    const totalPersonnel = await this.prisma.personnel.count();
    const totalDirections = await this.prisma.direction.count();
    const totalServices = await this.prisma.service.count();

    return {
      totalPersonnel,
      totalDirections,
      totalServices,
    };
  }

  // -----------------------------
  // Alertes
  // -----------------------------
  async createAlert(dto: CreateAlertDto) {
    // Ici on peut juste créer une table alerts si tu veux
    // Pour l'exemple, on logue
    this.logger.log(`Alerte créée : ${JSON.stringify(dto)}`);
    return { message: 'Alerte créée', data: dto };
  }
  
  // -----------------------------
  // type de congés
  // -----------------------------

  async createTypeConge(dto: CreateTypeCongeDto) {
    try {
      return await this.prisma.typeConge.create({
        data: {
          libelle_typeconge: dto.libelle_typeconge,
          is_active: dto.is_active ?? true, // par défaut true
        },
      });
    } catch (error) {
      // Gestion des erreurs Prisma, par exemple unicité
      if (error.code === 'P2002') {
        throw new BadRequestException('Ce libellé de type de congé existe déjà');
      }
      throw error;
    }
  }

  // -----------------------------
  // Consulter toutes les demandes
  // -----------------------------
  async consulterDemandes() {
    return this.prisma.demande.findMany({
      where: {
        statut_demande: 'APPROUVEE', // filtre les demandes approuvées
      },
      include: {
        periodeConge: true,
        service: true,
        personnel: true,
        chefService: true,
      },
    });
  }

}