import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { NotificationService } from '../shared/notification/notification.service';
import { UploaderService } from '../shared/uploader/uploader.service';
import { CreateBulletinPaieDto, UpdateBulletinPaieDto, CreatePaieDto } from './dto/comptabilite.dto';

@Injectable()
export class ComptabiliteService {
  private readonly logger = new Logger(ComptabiliteService.name);

  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
    private uploaderService: UploaderService,
  ) {}

  // -----------------------------
  // Personnel
  // -----------------------------

  /**
   * Récupère tous les personnels
   */
  async getAllPersonnel() {
    try {
      const personnels = await this.prisma.personnel.findMany({
        where: {
          nom_personnel: {
            not: 'Admin',
          },
        },
        include: {
          service: {
            include: {
              direction: true,
            },
          },
        },
        orderBy: {
          date_creation: 'desc',
        },
      });
      return personnels;
    } catch (error: any) {
      this.logger.error(`Erreur lors de la récupération du personnel: ${error.message}`);
      throw error;
    }
  }

  /**
   * Récupère un personnel par son ID
   */
  async getPersonnelById(id: string) {
    try {
      const personnel = await this.prisma.personnel.findUnique({
        where: { id_personnel: id },
        include: {
          service: {
            include: {
              direction: true,
            },
          },
          contrats: true,
          paies: {
            include: {
              bulletins: true,
            },
          },
        },
      });

      if (!personnel) {
        throw new NotFoundException('Personnel non trouvé');
      }

      return personnel;
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Erreur lors de la récupération du personnel: ${error.message}`);
      throw error;
    }
  }

  // -----------------------------
  // Contrats
  // -----------------------------

  /**
   * Récupère tous les contrats
   */
  async getAllContrats() {
    try {
      const contrats = await this.prisma.contrat.findMany({
        include: {
          personnel: {
            include: {
              service: true,
            },
          },
        },
        orderBy: {
          date_creation: 'desc',
        },
      });
      return contrats;
    } catch (error: any) {
      this.logger.error(`Erreur lors de la récupération des contrats: ${error.message}`);
      throw error;
    }
  }

  /**
   * Récupère un contrat par son ID
   */
  async getContratById(id: string) {
    try {
      const contrat = await this.prisma.contrat.findUnique({
        where: { id_contrat: id },
        include: {
          personnel: {
            include: {
              service: {
                include: {
                  direction: true,
                },
              },
            },
          },
        },
      });

      if (!contrat) {
        throw new NotFoundException('Contrat non trouvé');
      }

      return contrat;
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Erreur lors de la récupération du contrat: ${error.message}`);
      throw error;
    }
  }

  /**
   * Récupère tous les contrats d'un personnel
   */
  async getContratsByPersonnel(idPersonnel: string) {
    try {
      const contrats = await this.prisma.contrat.findMany({
        where: { id_personnel: idPersonnel },
        include: {
          personnel: {
            include: {
              service: true,
            },
          },
        },
        orderBy: {
          date_creation: 'desc',
        },
      });
      return contrats;
    } catch (error: any) {
      this.logger.error(`Erreur lors de la récupération des contrats du personnel: ${error.message}`);
      throw error;
    }
  }

  // -----------------------------
  // Paies
  // -----------------------------

  /**
   * Récupère toutes les paies
   */
  async getAllPaies() {
    try {
      const paies = await this.prisma.paie.findMany({
        include: {
          personnel: {
            include: {
              service: true,
            },
          },
          bulletins: true,
        },
        orderBy: {
          date_creation: 'desc',
        },
      });
      return paies;
    } catch (error: any) {
      this.logger.error(`Erreur lors de la récupération des paies: ${error.message}`);
      throw error;
    }
  }

  /**
   * Récupère une paie par son ID
   */
  async getPaieById(id: string) {
    try {
      const paie = await this.prisma.paie.findUnique({
        where: { id_paie: id },
        include: {
          personnel: {
            include: {
              service: {
                include: {
                  direction: true,
                },
              },
            },
          },
          bulletins: true,
        },
      });

      if (!paie) {
        throw new NotFoundException('Paie non trouvée');
      }

      return paie;
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Erreur lors de la récupération de la paie: ${error.message}`);
      throw error;
    }
  }

  /**
   * Récupère toutes les paies d'un personnel
   */
  async getPaiesByPersonnel(idPersonnel: string) {
    try {
      const paies = await this.prisma.paie.findMany({
        where: { id_personnel: idPersonnel },
        include: {
          personnel: {
            include: {
              service: true,
            },
          },
          bulletins: true,
        },
        orderBy: {
          date_creation: 'desc',
        },
      });
      return paies;
    } catch (error: any) {
      this.logger.error(`Erreur lors de la récupération des paies du personnel: ${error.message}`);
      throw error;
    }
  }

  /**
   * Crée une nouvelle paie
   */
  async createPaie(dto: CreatePaieDto, file: Express.Multer.File) {
    try {
      // Vérifier que le personnel existe
      const personnel = await this.prisma.personnel.findUnique({
        where: { id_personnel: dto.id_personnel },
      });

      if (!personnel) {
        throw new NotFoundException('Personnel non trouvé');
      }

      // Vérifier qu'il n'existe pas déjà une paie pour ce mois/année/personnel
      const paieExistante = await this.prisma.paie.findFirst({
        where: {
          id_personnel: dto.id_personnel,
          mois: dto.mois,
          annee: dto.annee,
        },
      });

      if (paieExistante) {
        throw new BadRequestException(
          `Une paie existe déjà pour ce personnel pour le mois ${dto.mois}/${dto.annee}`,
        );
      }

      // Vérifier que le fichier est fourni
      if (!file) {
        throw new BadRequestException('Le fichier PDF du bulletin de paie est requis');
      }

      // Uploader le fichier sur GitHub
      let urlBulletin: string;
      try {
        this.logger.log(`Upload du fichier bulletin de paie pour le personnel ${dto.id_personnel}`);
        urlBulletin = await this.uploaderService.uploadPdfToGitHub(file);
        this.logger.log(`Fichier uploadé avec succès: ${urlBulletin}`);
      } catch (error: any) {
        this.logger.error(`Erreur lors de l'upload du fichier: ${error.message}`);
        throw new BadRequestException(`Erreur lors de l'upload du fichier: ${error.message}`);
      }

      // Créer la paie
      const paie = await this.prisma.paie.create({
        data: {
          id_personnel: dto.id_personnel,
          mois: dto.mois,
          annee: dto.annee,
          salaire_brut: dto.salaire_brut,
          salaire_net: dto.salaire_net,
          primes: dto.primes || 0,
          deductions: dto.deductions || 0,
          url_bulletin: urlBulletin,
        },
        include: {
          personnel: {
            include: {
              service: {
                include: {
                  direction: true,
                },
              },
            },
          },
          bulletins: true,
        },
      });

      this.logger.log(`Paie créée: ${paie.id_paie} pour le personnel ${dto.id_personnel}`);

      // Créer automatiquement un bulletin de paie avec l'URL uploadée
      try {
        const bulletinDto: CreateBulletinPaieDto = {
          id_paie: paie.id_paie,
          url_pdf: urlBulletin,
        };
        await this.createBulletinPaie(bulletinDto);
        this.logger.log(`Bulletin de paie créé automatiquement pour la paie ${paie.id_paie}`);
      } catch (error: any) {
        // Logger l'erreur mais ne pas faire échouer la création de la paie
        this.logger.warn(`Erreur lors de la création automatique du bulletin de paie: ${error.message}`);
      }

      // Envoyer une notification au personnel
      await this.notificationService.createNotification(
        dto.id_personnel,
        'Nouvelle paie enregistrée',
        `Votre paie pour ${dto.mois}/${dto.annee} a été enregistrée.`,
      );

      // Récupérer la paie avec les bulletins mis à jour
      const paieAvecBulletins = await this.prisma.paie.findUnique({
        where: { id_paie: paie.id_paie },
        include: {
          personnel: {
            include: {
              service: {
                include: {
                  direction: true,
                },
              },
            },
          },
          bulletins: true,
        },
      });

      return paieAvecBulletins;
    } catch (error: any) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Erreur lors de la création de la paie: ${error.message}`);
      throw error;
    }
  }

  // -----------------------------
  // BulletinPaie - CRUD
  // -----------------------------

  /**
   * Crée un nouveau bulletin de paie
   */
  async createBulletinPaie(dto: CreateBulletinPaieDto, file?: Express.Multer.File) {
    try {
      // Vérifier que la paie existe
      const paie = await this.prisma.paie.findUnique({
        where: { id_paie: dto.id_paie },
        include: {
          personnel: true,
        },
      });

      if (!paie) {
        throw new NotFoundException('Paie non trouvée');
      }

      // Si un fichier est fourni, l'uploader
      let urlPdf = dto.url_pdf;
      if (file) {
        if (!urlPdf) {
          // Uploader le fichier PDF
          urlPdf = await this.uploaderService.uploadPdfToGitHub(file);
          this.logger.log(`Fichier PDF uploadé: ${urlPdf}`);
        } else {
          throw new BadRequestException('Vous ne pouvez pas fournir à la fois un fichier et une URL. Utilisez soit un fichier, soit une URL.');
        }
      }

      if (!urlPdf) {
        throw new BadRequestException('Vous devez fournir soit un fichier PDF, soit une URL PDF');
      }

      // Créer le bulletin de paie
      const bulletinPaie = await this.prisma.bulletinPaie.create({
        data: {
          id_paie: dto.id_paie,
          url_pdf: urlPdf,
          note_rh: dto.note_rh,
          date_emission: dto.date_emission ? new Date(dto.date_emission) : new Date(),
        },
        include: {
          paie: {
            include: {
              personnel: {
                include: {
                  service: true,
                },
              },
            },
          },
        },
      });

      this.logger.log(`Bulletin de paie créé: ${bulletinPaie.id_bulletin}`);

      // Envoyer une notification au personnel
      await this.notificationService.createNotification(
        paie.id_personnel,
        'Nouveau bulletin de paie disponible',
        `Votre bulletin de paie pour ${paie.mois}/${paie.annee} est maintenant disponible.`,
      );

      return bulletinPaie;
    } catch (error: any) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Erreur lors de la création du bulletin de paie: ${error.message}`);
      throw error;
    }
  }

  /**
   * Récupère tous les bulletins de paie
   */
  async getAllBulletinsPaie() {
    try {
      const bulletins = await this.prisma.bulletinPaie.findMany({
        include: {
          paie: {
            include: {
              personnel: {
                include: {
                  service: {
                    include: {
                      direction: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          date_emission: 'desc',
        },
      });
      return bulletins;
    } catch (error: any) {
      this.logger.error(`Erreur lors de la récupération des bulletins de paie: ${error.message}`);
      throw error;
    }
  }

  /**
   * Récupère un bulletin de paie par son ID avec toutes les données associées
   */
  async getBulletinPaieById(id: string) {
    try {
      const bulletin = await this.prisma.bulletinPaie.findUnique({
        where: { id_bulletin: id },
        include: {
          paie: {
            include: {
              personnel: {
                include: {
                  service: {
                    include: {
                      direction: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!bulletin) {
        throw new NotFoundException('Bulletin de paie non trouvé');
      }

      // Formater la réponse selon l'exemple JSON fourni
      return {
        bulletinPaie: {
          id_bulletin: bulletin.id_bulletin,
          date_emission: bulletin.date_emission,
          note_rh: bulletin.note_rh,
          url_pdf: bulletin.url_pdf,
          paie: {
            id_paie: bulletin.paie.id_paie,
            mois: bulletin.paie.mois,
            annee: bulletin.paie.annee,
            salaire_brut: bulletin.paie.salaire_brut,
            primes: bulletin.paie.primes || 0,
            deductions: bulletin.paie.deductions || 0,
            salaire_net: bulletin.paie.salaire_net,
          },
          personnel: {
            id_personnel: bulletin.paie.personnel.id_personnel,
            nom_personnel: bulletin.paie.personnel.nom_personnel,
            prenom_personnel: bulletin.paie.personnel.prenom_personnel,
            matricule_personnel: bulletin.paie.personnel.matricule_personnel,
            poste: bulletin.paie.personnel.poste,
            type_contrat: bulletin.paie.personnel.type_contrat,
            numero_cnps: bulletin.paie.personnel.numero_cnps,
            banque_nom: bulletin.paie.personnel.banque_nom,
            banque_rib: bulletin.paie.personnel.banque_rib,
            email_travail: bulletin.paie.personnel.email_travail,
            telephone_travail: bulletin.paie.personnel.telephone_travail,
          },
        },
      };
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Erreur lors de la récupération du bulletin de paie: ${error.message}`);
      throw error;
    }
  }

  /**
   * Met à jour un bulletin de paie
   */
  async updateBulletinPaie(id: string, dto: UpdateBulletinPaieDto) {
    try {
      // Vérifier que le bulletin existe
      const existingBulletin = await this.prisma.bulletinPaie.findUnique({
        where: { id_bulletin: id },
        include: {
          paie: {
            include: {
              personnel: true,
            },
          },
        },
      });

      if (!existingBulletin) {
        throw new NotFoundException('Bulletin de paie non trouvé');
      }

      // Préparer les données de mise à jour
      const updateData: any = {};
      if (dto.url_pdf !== undefined) updateData.url_pdf = dto.url_pdf;
      if (dto.note_rh !== undefined) updateData.note_rh = dto.note_rh;
      if (dto.date_emission !== undefined) updateData.date_emission = new Date(dto.date_emission);

      // Mettre à jour le bulletin
      const bulletinPaie = await this.prisma.bulletinPaie.update({
        where: { id_bulletin: id },
        data: updateData,
        include: {
          paie: {
            include: {
              personnel: {
                include: {
                  service: true,
                },
              },
            },
          },
        },
      });

      this.logger.log(`Bulletin de paie mis à jour: ${bulletinPaie.id_bulletin}`);

      // Envoyer une notification au personnel si le bulletin a été modifié
      await this.notificationService.createNotification(
        existingBulletin.paie.id_personnel,
        'Bulletin de paie mis à jour',
        `Votre bulletin de paie pour ${existingBulletin.paie.mois}/${existingBulletin.paie.annee} a été mis à jour.`,
      );

      return bulletinPaie;
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Erreur lors de la mise à jour du bulletin de paie: ${error.message}`);
      throw error;
    }
  }

  /**
   * Supprime un bulletin de paie
   */
  async deleteBulletinPaie(id: string) {
    try {
      // Vérifier que le bulletin existe
      const existingBulletin = await this.prisma.bulletinPaie.findUnique({
        where: { id_bulletin: id },
        include: {
          paie: {
            include: {
              personnel: true,
            },
          },
        },
      });

      if (!existingBulletin) {
        throw new NotFoundException('Bulletin de paie non trouvé');
      }

      // Supprimer le bulletin
      await this.prisma.bulletinPaie.delete({
        where: { id_bulletin: id },
      });

      this.logger.log(`Bulletin de paie supprimé: ${id}`);

      return { message: 'Bulletin de paie supprimé avec succès' };
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Erreur lors de la suppression du bulletin de paie: ${error.message}`);
      throw error;
    }
  }

  /**
   * Récupère tous les bulletins de paie d'un personnel
   */
  async getBulletinsPaieByPersonnel(idPersonnel: string) {
    try {
      const bulletins = await this.prisma.bulletinPaie.findMany({
        where: {
          paie: {
            id_personnel: idPersonnel,
          },
        },
        include: {
          paie: {
            include: {
              personnel: {
                include: {
                  service: true,
                },
              },
            },
          },
        },
        orderBy: {
          date_emission: 'desc',
        },
      });
      return bulletins;
    } catch (error: any) {
      this.logger.error(`Erreur lors de la récupération des bulletins de paie du personnel: ${error.message}`);
      throw error;
    }
  }
}

