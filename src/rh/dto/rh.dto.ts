import { IsNotEmpty, IsString, IsOptional, IsEmail, IsUUID, IsInt, Min, IsDateString, IsNumber, IsEnum, Max, Min as MinValidator } from 'class-validator';
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
  })
  @IsEmail()
  @IsNotEmpty()
  email_direction: string;

  @ApiProperty({
    description: 'Nombre de personnel',
    example: 50,
  })
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  @IsOptional()
  nb_personnel?: number;

  @ApiProperty({
    description: 'Numéro de la direction',
    example: '418-123-4567',
    required: false,
  })
  @IsString()
  @IsOptional()
  numero_direction?: string;

  @ApiProperty({
    description: 'Email professionnel de la direction',
    example: 'business@assnat.qc.ca',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  business_email?: string;

  @ApiProperty({
    description: 'Téléphone professionnel de la direction',
    example: '418-123-4567',
    required: false,
  })
  @IsString()
  @IsOptional()
  business_phone?: string;

  @ApiProperty({
    description: 'Email du directeur',
    example: 'directeur@assnat.qc.ca',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  directeur_email?: string;

  @ApiProperty({
    description: 'Téléphone du directeur',
    example: '418-987-6543',
    required: false,
  })
  @IsString()
  @IsOptional()
  directeur_phone?: string;

  @ApiProperty({
    description: 'Nombre de bureaux',
    example: '10',
    required: false,
  })
  @IsString()
  @IsOptional()
  nombre_bureau?: string;

  @ApiProperty({
    description: 'Nombre de services',
    example: '5',
    required: false,
  })
  @IsString()
  @IsOptional()
  nombre_service?: string;

  @ApiProperty({
    description: 'Motif de création de la direction',
    example: 'Réorganisation structurelle',
    required: false,
  })
  @IsString()
  @IsOptional()
  motif_creation?: string;

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

  @ApiProperty({
    description: 'ID du chef de service',
    example: 'uuid-du-chef-de-service',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  id_chefdeservice?: string;
  
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
    description: 'Date de naissance',
    example: '1990-01-15',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  date_naissance?: Date;

  @ApiProperty({
    description: 'Poste du personnel',
    example: 'Développeur Full Stack',
    required: false,
  })
  @IsString()
  @IsOptional()
  poste?: string;

  @ApiProperty({
    description: 'Type de contrat',
    example: 'CDI',
    enum: ['CDI', 'CDD', 'STAGE', 'CONSULTANT'],
    required: false,
  })
  @IsEnum(['CDI', 'CDD', 'STAGE', 'CONSULTANT'])
  @IsOptional()
  type_contrat?: 'CDI' | 'CDD' | 'STAGE' | 'CONSULTANT';

  @ApiProperty({
    description: 'Date d\'embauche',
    example: '2024-01-15',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  date_embauche?: Date;

  @ApiProperty({
    description: 'Date de fin de contrat',
    example: '2025-01-15',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  date_fin_contrat?: Date;

  @ApiProperty({
    description: 'Salaire de base',
    example: 50000.00,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  salaire_base?: number;

  @ApiProperty({
    description: 'Niveau hiérarchique',
    example: 'Niveau 3',
    required: false,
  })
  @IsString()
  @IsOptional()
  niveau_hierarchique?: string;

  @ApiProperty({
    description: 'Numéro CNPS',
    example: 'CNPS123456',
    required: false,
  })
  @IsString()
  @IsOptional()
  numero_cnps?: string;

  @ApiProperty({
    description: 'Nom de la banque',
    example: 'Banque Nationale',
    required: false,
  })
  @IsString()
  @IsOptional()
  banque_nom?: string;

  @ApiProperty({
    description: 'RIB (Relevé d\'Identité Bancaire)',
    example: 'FR76 1234 5678 9012 3456 7890 123',
    required: false,
  })
  @IsString()
  @IsOptional()
  banque_rib?: string;

  @ApiProperty({
    description: 'Statut professionnel',
    example: 'ACTIF',
    enum: ['ACTIF', 'SUSPENDU', 'EN_CONGE', 'DEMISSIONNE', 'LICENCIE'],
    required: false,
  })
  @IsEnum(['ACTIF', 'SUSPENDU', 'EN_CONGE', 'DEMISSIONNE', 'LICENCIE'])
  @IsOptional()
  statut_professionnel?: 'ACTIF' | 'SUSPENDU' | 'EN_CONGE' | 'DEMISSIONNE' | 'LICENCIE';

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
  
  @IsOptional()
  is_archiver?: boolean;

  @ApiProperty({
    description: 'Poste du personnel',
    example: 'Développeur Full Stack',
    required: false,
  })
  @IsString()
  @IsOptional()
  poste?: string;

  @ApiProperty({
    description: 'Type de contrat',
    example: 'CDI',
    enum: ['CDI', 'CDD', 'STAGE', 'CONSULTANT'],
    required: false,
  })
  @IsEnum(['CDI', 'CDD', 'STAGE', 'CONSULTANT'])
  @IsOptional()
  type_contrat?: 'CDI' | 'CDD' | 'STAGE' | 'CONSULTANT';

  @ApiProperty({
    description: 'Date d\'embauche',
    example: '2024-01-15',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  date_embauche?: Date;

  @ApiProperty({
    description: 'Date de fin de contrat',
    example: '2025-01-15',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  date_fin_contrat?: Date;

  @ApiProperty({
    description: 'Salaire de base',
    example: 50000.00,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  salaire_base?: number;

  @ApiProperty({
    description: 'Niveau hiérarchique',
    example: 'Niveau 3',
    required: false,
  })
  @IsString()
  @IsOptional()
  niveau_hierarchique?: string;

  @ApiProperty({
    description: 'Numéro CNPS',
    example: 'CNPS123456',
    required: false,
  })
  @IsString()
  @IsOptional()
  numero_cnps?: string;

  @ApiProperty({
    description: 'Nom de la banque',
    example: 'Banque Nationale',
    required: false,
  })
  @IsString()
  @IsOptional()
  banque_nom?: string;

  @ApiProperty({
    description: 'RIB (Relevé d\'Identité Bancaire)',
    example: 'FR76 1234 5678 9012 3456 7890 123',
    required: false,
  })
  @IsString()
  @IsOptional()
  banque_rib?: string;

  @ApiProperty({
    description: 'Statut professionnel',
    example: 'ACTIF',
    enum: ['ACTIF', 'SUSPENDU', 'EN_CONGE', 'DEMISSIONNE', 'LICENCIE'],
    required: false,
  })
  @IsEnum(['ACTIF', 'SUSPENDU', 'EN_CONGE', 'DEMISSIONNE', 'LICENCIE'])
  @IsOptional()
  statut_professionnel?: 'ACTIF' | 'SUSPENDU' | 'EN_CONGE' | 'DEMISSIONNE' | 'LICENCIE';
}

export class CreateInteractionRhDto {
  @ApiProperty({
    description: 'Titre de l\'interaction RH',
    example: 'Réunion mensuelle',
  })
  @IsString()
  @IsNotEmpty()
  titre: string;

  @ApiProperty({
    description: 'Message de l\'interaction RH',
    example: 'Réunion prévue le 15 du mois pour discuter des congés',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    description: 'Date de l\'interaction RH',
    example: '2025-01-15T10:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  date?: Date;
}

export class CreateContratDto {
  @ApiProperty({
    description: 'Type de contrat',
    example: 'CDI',
    enum: ['CDI', 'CDD', 'STAGE', 'CONSULTANT'],
  })
  @IsEnum(['CDI', 'CDD', 'STAGE', 'CONSULTANT'])
  @IsNotEmpty()
  type_contrat: 'CDI' | 'CDD' | 'STAGE' | 'CONSULTANT';

  @ApiProperty({
    description: 'Date de début du contrat',
    example: '2024-01-15',
  })
  @IsDateString()
  @IsNotEmpty()
  date_debut: string;

  @ApiProperty({
    description: 'Date de fin du contrat',
    example: '2025-01-15',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  date_fin?: string;

  @ApiProperty({
    description: 'Salaire de référence',
    example: 50000.00,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  salaire_reference?: number;

  @ApiProperty({
    description: 'Statut du contrat',
    example: 'Actif',
    required: false,
  })
  @IsString()
  @IsOptional()
  statut?: string;

  @ApiProperty({
    description: 'ID du personnel',
    example: 'uuid-du-personnel',
  })
  @IsUUID()
  @IsNotEmpty()
  id_personnel: string;
}

export class UpdateContratDto {
  @ApiProperty({
    description: 'Type de contrat',
    example: 'CDI',
    enum: ['CDI', 'CDD', 'STAGE', 'CONSULTANT'],
    required: false,
  })
  @IsEnum(['CDI', 'CDD', 'STAGE', 'CONSULTANT'])
  @IsOptional()
  type_contrat?: 'CDI' | 'CDD' | 'STAGE' | 'CONSULTANT';

  @ApiProperty({
    description: 'Date de début du contrat',
    example: '2024-01-15',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  date_debut?: string;

  @ApiProperty({
    description: 'Date de fin du contrat',
    example: '2025-01-15',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  date_fin?: string;

  @ApiProperty({
    description: 'Salaire de référence',
    example: 50000.00,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  salaire_reference?: number;

  @ApiProperty({
    description: 'URL du contrat (fichier PDF)',
    example: 'https://example.com/contrat.pdf',
    required: false,
  })
  @IsString()
  @IsOptional()
  url_contrat?: string;

  @ApiProperty({
    description: 'Statut du contrat',
    example: 'Actif',
    required: false,
  })
  @IsString()
  @IsOptional()
  statut?: string;
}

export class CreatePaieDto {
  @ApiProperty({
    description: 'Mois de la paie',
    example: 1,
    minimum: 1,
    maximum: 12,
  })
  @IsInt()
  @MinValidator(1)
  @Max(12)
  @IsNotEmpty()
  mois: number;

  @ApiProperty({
    description: 'Année de la paie',
    example: 2024,
    minimum: 2000,
  })
  @IsInt()
  @MinValidator(2000)
  @IsNotEmpty()
  annee: number;

  @ApiProperty({
    description: 'Salaire net',
    example: 3500.00,
  })
  @IsNumber()
  @IsNotEmpty()
  salaire_net: number;

  @ApiProperty({
    description: 'Salaire brut',
    example: 4500.00,
  })
  @IsNumber()
  @IsNotEmpty()
  salaire_brut: number;

  @ApiProperty({
    description: 'Primes',
    example: 500.00,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  primes?: number;

  @ApiProperty({
    description: 'Déductions',
    example: 200.00,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  deductions?: number;

  @ApiProperty({
    description: 'ID du personnel',
    example: 'uuid-du-personnel',
  })
  @IsUUID()
  @IsNotEmpty()
  id_personnel: string;
}

export class UpdatePaieDto {
  @ApiProperty({
    description: 'Mois de la paie',
    example: 1,
    minimum: 1,
    maximum: 12,
    required: false,
  })
  @IsInt()
  @MinValidator(1)
  @Max(12)
  @IsOptional()
  mois?: number;

  @ApiProperty({
    description: 'Année de la paie',
    example: 2024,
    minimum: 2000,
    required: false,
  })
  @IsInt()
  @MinValidator(2000)
  @IsOptional()
  annee?: number;

  @ApiProperty({
    description: 'Salaire net',
    example: 3500.00,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  salaire_net?: number;

  @ApiProperty({
    description: 'Salaire brut',
    example: 4500.00,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  salaire_brut?: number;

  @ApiProperty({
    description: 'Primes',
    example: 500.00,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  primes?: number;

  @ApiProperty({
    description: 'Déductions',
    example: 200.00,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  deductions?: number;

  @ApiProperty({
    description: 'URL du bulletin de paie (fichier PDF)',
    example: 'https://example.com/bulletin.pdf',
    required: false,
  })
  @IsString()
  @IsOptional()
  url_bulletin?: string;
}

export class CreatePersonnelDocumentDto {
  @ApiProperty({
    description: 'Type de document',
    example: 'CNI',
    enum: ['CNI', 'CONTRAT', 'DIPLOME', 'ATTestation'],
  })
  @IsEnum(['CNI', 'CONTRAT', 'DIPLOME', 'ATTestation'])
  @IsNotEmpty()
  type_document: 'CNI' | 'CONTRAT' | 'DIPLOME' | 'ATTestation';

  @ApiProperty({
    description: 'ID du personnel',
    example: 'uuid-du-personnel',
  })
  @IsUUID()
  @IsNotEmpty()
  id_personnel: string;
}

export class UpdatePersonnelDocumentDto {
  @ApiProperty({
    description: 'Type de document',
    example: 'CNI',
    enum: ['CNI', 'CONTRAT', 'DIPLOME', 'ATTestation'],
    required: false,
  })
  @IsEnum(['CNI', 'CONTRAT', 'DIPLOME', 'ATTestation'])
  @IsOptional()
  type_document?: 'CNI' | 'CONTRAT' | 'DIPLOME' | 'ATTestation';

  @ApiProperty({
    description: 'URL du document (fichier PDF, image, etc.)',
    example: 'https://example.com/document.pdf',
    required: false,
  })
  @IsString()
  @IsOptional()
  url_document?: string;
}

