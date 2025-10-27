import {
  IsString,
  IsEmail,
  IsOptional,
  IsDate,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { RolePersonnel, TypePersonnel } from '@prisma/client';

export class CreatePersonnelDto {
  @IsString()
  nom_personnel: string;

  @IsString()
  prenom_personnel: string;

  @IsOptional()
  @IsEmail()
  email_personnel?: string;

  @IsOptional()
  @IsEmail()
  email_travail?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsDate()
  date_naissance?: Date;

  @IsOptional()
  @IsString()
  matricule_personnel?: string;

  @IsOptional()
  @IsString()
  telephone_travail?: string;

  @IsOptional()
  @IsString()
  telephone_personnel?: string;

  @IsOptional()
  @IsString()
  ville_personnel?: string;

  @IsOptional()
  @IsString()
  adresse_personnel?: string;

  @IsOptional()
  @IsString()
  codepostal?: string;

  @IsOptional()
  @IsString()
  pays_personnel?: string;

  @IsOptional()
  @IsString()
  telephone_contact_urgence?: string;

  @IsOptional()
  @IsString()
  nom_contact_urgence?: string;

  @IsOptional()
  @IsEnum(RolePersonnel)
  role_personnel?: RolePersonnel;

  @IsOptional()
  @IsEnum(TypePersonnel)
  type_personnel?: TypePersonnel;

  @IsString()
  id_service: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
