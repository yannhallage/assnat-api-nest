import { IsNotEmpty, IsString, IsOptional, IsEmail, IsUUID, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDirectionDto {
  @ApiProperty({
    description: 'Code de la direction',
    example: 'DIR001',
  })
  @IsString()
  @IsNotEmpty()
  code_direction: string;

  @ApiProperty({
    description: 'Nom de la direction',
    example: 'Direction des Ressources Humaines',
  })
  @IsString()
  @IsNotEmpty()
  nom_direction: string;

  @ApiProperty({
    description: 'Nom du directeur',
    example: 'Jean Dupont',
  })
  @IsString()
  @IsNotEmpty()
  nom_directeur: string;

  @ApiProperty({
    description: 'Email de la direction',
    example: 'direction@assnat.qc.ca',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email_direction?: string;

  @ApiProperty({
    description: 'Statut de la direction',
    example: 'ACTIF',
    required: false,
  })
  @IsString()
  @IsOptional()
  statut?: string;
}

export class CreateServiceDto {
  @ApiProperty({
    description: 'Code du service',
    example: 'SERV001',
  })
  @IsString()
  @IsNotEmpty()
  code_service: string;

  @ApiProperty({
    description: 'Nom du service',
    example: 'Service RH',
  })
  @IsString()
  @IsNotEmpty()
  nom_service: string;

  @ApiProperty({
    description: 'ID de la direction',
    example: 'uuid-de-la-direction',
  })
  @IsUUID()
  @IsNotEmpty()
  id_direction: string;
  @IsUUID()
  @IsNotEmpty()
  id_chef_de_service: string;
}

export class CreatePersonnelDto {
  @ApiProperty({
    description: 'Nom du personnel',
    example: 'Dupont',
  })
  @IsString()
  @IsNotEmpty()
  nom_personnel: string;

  @ApiProperty({
    description: 'Prénom du personnel',
    example: 'Jean',
  })
  @IsString()
  @IsNotEmpty()
  prenom_personnel: string;

  @ApiProperty({
    description: 'Email de travail',
    example: 'jean.dupont@assnat.qc.ca',
  })
  @IsEmail()
  @IsNotEmpty()
  email_travail: string;

  @ApiProperty({
    description: 'Email personnel',
    example: 'jean.dupont@gmail.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email_personnel?: string;

  @ApiProperty({
    description: 'Mot de passe',
    example: 'motdepasse123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'Matricule du personnel',
    example: 'EMP123',
    required: false,
  })
  @IsString()
  @IsOptional()
  matricule_personnel?: string;

  @ApiProperty({
    description: 'Téléphone de travail',
    example: '418-123-4567',
    required: false,
  })
  @IsString()
  @IsOptional()
  telephone_travail?: string;

  @ApiProperty({
    description: 'Téléphone personnel',
    example: '418-987-6543',
    required: false,
  })
  @IsString()
  @IsOptional()
  telephone_personnel?: string;

  @ApiProperty({
    description: 'Ville du personnel',
    example: 'Québec',
    required: false,
  })
  @IsString()
  @IsOptional()
  ville_personnel?: string;

  @ApiProperty({
    description: 'Adresse du personnel',
    example: '123 rue de la Paix',
    required: false,
  })
  @IsString()
  @IsOptional()
  adresse_personnel?: string;

  @ApiProperty({
    description: 'Code postal',
    example: 'G1R 4P5',
    required: false,
  })
  @IsString()
  @IsOptional()
  codepostal?: string;

  @ApiProperty({
    description: 'Pays du personnel',
    example: 'Canada',
    required: false,
  })
  @IsString()
  @IsOptional()
  pays_personnel?: string;

  @ApiProperty({
    description: 'Téléphone de contact d\'urgence',
    example: '418-555-1234',
    required: false,
  })
  @IsString()
  @IsOptional()
  telephone_contact_urgence?: string;

  @ApiProperty({
    description: 'Nom du contact d\'urgence',
    example: 'Marie Dupont',
    required: false,
  })
  @IsString()
  @IsOptional()
  nom_contact_urgence?: string;

  @ApiProperty({
    description: 'Rôle du personnel',
    example: 'EMPLOYE',
    enum: ['ADMIN', 'RH', 'CHEF_SERVICE', 'EMPLOYE'],
  })
  @IsString()
  @IsNotEmpty()
  role_personnel: 'ADMIN' | 'RH' | 'CHEF_SERVICE' | 'EMPLOYE';

  @ApiProperty({
    description: 'Type de personnel',
    example: 'PERMANENT',
    enum: ['PERMANENT', 'CONTRACTUEL', 'STAGIAIRE'],
  })
  @IsString()
  @IsNotEmpty()
  type_personnel: 'PERMANENT' | 'CONTRACTUEL' | 'STAGIAIRE';

  @ApiProperty({
    description: 'ID du service',
    example: 'uuid-du-service',
  })
  @IsUUID()
  @IsNotEmpty()
  id_service: string;
}

export class UpdatePersonnelDto {
  @ApiProperty({
    description: 'Nom du personnel',
    example: 'Dupont',
    required: false,
  })
  @IsString()
  @IsOptional()
  nom_personnel?: string;

  @ApiProperty({
    description: 'Prénom du personnel',
    example: 'Jean',
    required: false,
  })
  @IsString()
  @IsOptional()
  prenom_personnel?: string;

  @ApiProperty({
    description: 'Email de travail',
    example: 'jean.dupont@assnat.qc.ca',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email_travail?: string;

  @ApiProperty({
    description: 'Email personnel',
    example: 'jean.dupont@gmail.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email_personnel?: string;

  @ApiProperty({
    description: 'Matricule du personnel',
    example: 'EMP123',
    required: false,
  })
  @IsString()
  @IsOptional()
  matricule_personnel?: string;

  @ApiProperty({
    description: 'Téléphone de travail',
    example: '418-123-4567',
    required: false,
  })
  @IsString()
  @IsOptional()
  telephone_travail?: string;

  @ApiProperty({
    description: 'Téléphone personnel',
    example: '418-987-6543',
    required: false,
  })
  @IsString()
  @IsOptional()
  telephone_personnel?: string;

  @ApiProperty({
    description: 'Rôle du personnel',
    example: 'EMPLOYE',
    enum: ['ADMIN', 'RH', 'CHEF_SERVICE', 'EMPLOYE'],
    required: false,
  })
  @IsString()
  @IsOptional()
  role_personnel?: 'ADMIN' | 'RH' | 'CHEF_SERVICE' | 'EMPLOYE';

  @ApiProperty({
    description: 'Type de personnel',
    example: 'PERMANENT',
    enum: ['PERMANENT', 'CONTRACTUEL', 'STAGIAIRE'],
    required: false,
  })
  @IsString()
  @IsOptional()
  type_personnel?: 'PERMANENT' | 'CONTRACTUEL' | 'STAGIAIRE';

  @ApiProperty({
    description: 'Statut actif',
    example: true,
    required: false,
  })
  @IsOptional()
  is_active?: boolean;
}

