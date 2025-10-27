import { IsString, IsOptional, IsEmail, IsInt } from 'class-validator';

export class CreateDirectionDto {
  @IsString()
  code_direction: string;

  @IsString()
  nom_direction: string;

  @IsOptional()
  @IsInt()
  nb_personnel?: number;

  @IsString()
  nom_directeur: string;

  @IsOptional()
  @IsEmail()
  email_direction?: string;

  @IsOptional()
  @IsString()
  statut?: string;
}
