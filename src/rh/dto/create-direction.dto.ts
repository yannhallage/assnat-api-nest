import { IsString, IsOptional, IsEmail, IsInt } from 'class-validator';

export class CreateDirectionDto {
  @IsString()
  code_direction: string;

  @IsString()
  nom_direction: string;

  @IsString()
  nom_directeur: string;

  @IsEmail()
  email_direction: string;

  @IsOptional()
  @IsInt()
  nb_personnel?: number;

  @IsOptional()
  @IsString()
  numero_direction?: string;

  @IsOptional()
  @IsEmail()
  business_email?: string;

  @IsOptional()
  @IsString()
  business_phone?: string;

  @IsOptional()
  @IsEmail()
  directeur_email?: string;

  @IsOptional()
  @IsString()
  directeur_phone?: string;

  @IsOptional()
  @IsString()
  nombre_bureau?: string;

  @IsOptional()
  @IsString()
  nombre_service?: string;

  @IsOptional()
  @IsString()
  motif_creation?: string;

  @IsOptional()
  @IsString()
  statut?: string;
}
