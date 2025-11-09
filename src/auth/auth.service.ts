  import { Injectable, UnauthorizedException } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import * as bcrypt from 'bcryptjs';
  import { PrismaService } from '../shared/prisma/prisma.service';
  import { Personnel } from '@prisma/client';
  import { LoginDto } from './dto/login.dto';

  @Injectable()
  export class AuthService {
    constructor(
      private prisma: PrismaService,
      private jwtService: JwtService,
    ) { }

    // -----------------------------
    // Valider le personnel
    // -----------------------------
    async validatePersonnel(email: string, password: string): Promise<Personnel> {
      const user = await this.prisma.personnel.findFirst({
        where: { email_personnel: email, is_active: true },
      });

      if (!user || !user.password) {
        throw new UnauthorizedException('Identifiants invalides');
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new UnauthorizedException('Mot de passe incorrect');
      }

      if (!user.email_personnel) {
        throw new UnauthorizedException('Email du personnel manquant');
      }

      return user;
    }

    // -----------------------------
    // Authentification et génération JWT
    // -----------------------------
    async login(dto: LoginDto): Promise<{
      access_token: string;
      user: {
        id: string;
        email: string;
        nom: string;
        prenom: string;
        role: string;
        id_service: string;
      };
      redirect: string;
    }> {
      const user = await this.validatePersonnel(dto.email_personnel, dto.password);

      // ✅ Correction de la typo
      const payload = {
        sub: user.id_personnel,
        email: user.email_personnel!,
        role: user.role_personnel,
        nom: user.nom_personnel,
        prenom: user.prenom_personnel,
        id_service: user.id_service,
      };

      const access_token = this.jwtService.sign(payload);

      // Détermination de la route de redirection selon le rôle
      let redirect: string;
      switch (user.role_personnel) {
        case 'RH':
        case 'ADMIN':
          redirect = 'rh';
          break;
        case 'CHEF_SERVICE':
          redirect = 'chef';
          break;
        default:
          redirect = 'employe';
      }

      return {
        access_token,
        user: {
          id: user.id_personnel,
          email: user.email_travail!, // à vérifier si tu veux email_travail ou email_personnel
          nom: user.nom_personnel,
          prenom: user.prenom_personnel,
          role: user.role_personnel,
          id_service: user.id_service,
        },
        redirect,
      };
    }
  }
