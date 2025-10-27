import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { CreateDirectionDto } from './dto/create-direction.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { CreatePersonnelDto } from './dto/create-personnel.dto';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdatePersonnelDto } from './dto/update-personnel.dto';

@Injectable()
export class RhService {
  private readonly logger = new Logger(RhService.name);

  constructor(private prisma: PrismaService) { }

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
  // Personnel
  // -----------------------------
  async createPersonnel(dto: CreatePersonnelDto) {
    return this.prisma.personnel.create({ data: dto });
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
  // Consulter toutes les demandes
  // -----------------------------
  async consulterDemandes() {
    return this.prisma.demande.findMany({
      include: {
        periodeConge: true,
        service: true,
      },
    });
  }
}
