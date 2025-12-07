import { IsNotEmpty, IsString, IsOptional, IsUUID, IsDateString, IsUrl, IsInt, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateBulletinPaieDto {
  @ApiProperty({
    description: 'ID de la paie associée',
    example: 'e8d9f1b0-1234-4f5a-9876-abcdef123456',
  })
  @IsUUID()
  @IsNotEmpty()
  id_paie: string;

  @ApiProperty({
    description: 'URL du PDF du bulletin de paie (optionnel si fichier fourni)',
    example: 'https://storage.example.com/bulletins/2025_12_bulletin_john_doe.pdf',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  url_pdf?: string;

  @ApiProperty({
    description: 'Note du RH (optionnelle)',
    example: 'Prime exceptionnelle pour projet terminé',
    required: false,
  })
  @IsString()
  @IsOptional()
  note_rh?: string;

  @ApiProperty({
    description: 'Date d\'émission du bulletin',
    example: '2025-12-06T12:00:00.000Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  date_emission?: string;
}

export class UpdateBulletinPaieDto {
  @ApiProperty({
    description: 'URL du PDF du bulletin de paie',
    example: 'https://storage.example.com/bulletins/2025_12_bulletin_john_doe.pdf',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  url_pdf?: string;

  @ApiProperty({
    description: 'Note du RH (optionnelle)',
    example: 'Prime exceptionnelle pour projet terminé',
    required: false,
  })
  @IsString()
  @IsOptional()
  note_rh?: string;

  @ApiProperty({
    description: 'Date d\'émission du bulletin',
    example: '2025-12-06T12:00:00.000Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  date_emission?: string;
}

export class CreatePaieDto {
  @ApiProperty({
    description: 'ID du personnel',
    example: 'e8d9f1b0-1234-4f5a-9876-abcdef123456',
  })
  @IsUUID()
  @IsNotEmpty()
  id_personnel: string;

  @ApiProperty({
    description: 'Mois de la paie (1-12)',
    example: 12,
    minimum: 1,
    maximum: 12,
  })
  @IsInt()
  @Min(1)
  @Max(12)
  @IsNotEmpty()
  @Type(() => Number)
  mois: number;

  @ApiProperty({
    description: 'Année de la paie',
    example: 2025,
    minimum: 2000,
  })
  @IsInt()
  @Min(2000)
  @IsNotEmpty()
  @Type(() => Number)
  annee: number;

  @ApiProperty({
    description: 'Salaire brut',
    example: 500000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  @Type(() => Number)
  salaire_brut: number;

  @ApiProperty({
    description: 'Salaire net',
    example: 450000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  @Type(() => Number)
  salaire_net: number;

  @ApiProperty({
    description: 'Primes (optionnel)',
    example: 50000,
    minimum: 0,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  primes?: number;

  @ApiProperty({
    description: 'Déductions (optionnel)',
    example: 50000,
    minimum: 0,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  deductions?: number;

  @ApiProperty({
    description: 'URL du bulletin de paie (optionnel)',
    example: 'https://storage.example.com/bulletins/2025_12_bulletin.pdf',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  url_bulletin?: string;
}

