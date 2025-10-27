import { IsNotEmpty, IsString, IsOptional, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDemandeDto {
  @ApiProperty({
    description: 'Type de demande',
    example: 'Congé Annuel',
  })
  @IsString()
  @IsNotEmpty()
  type_demande: string;

  @ApiProperty({
    description: 'Motif de la demande',
    example: 'Vacances familiales',
    required: false,
  })
  @IsString()
  @IsOptional()
  motif?: string;

  @ApiProperty({
    description: 'ID de la période de congé',
    example: 'uuid-de-la-periode',
  })
  @IsUUID()
  @IsNotEmpty()
  id_periodeconge: string;
}

export class CreatePeriodeCongeDto {
  @ApiProperty({
    description: 'Date de début du congé',
    example: '2024-07-01',
  })
  @IsDateString()
  @IsNotEmpty()
  date_debut: string;

  @ApiProperty({
    description: 'Date de fin du congé',
    example: '2024-07-15',
  })
  @IsDateString()
  @IsNotEmpty()
  date_fin: string;

  @ApiProperty({
    description: 'Nombre de jours de congé',
    example: 10,
  })
  @IsNotEmpty()
  nb_jour: number;

  @ApiProperty({
    description: 'ID du type de congé',
    example: 'uuid-du-type-conge',
  })
  @IsUUID()
  @IsNotEmpty()
  id_typeconge: string;
}

export class CreateDiscussionDto {
  @ApiProperty({
    description: 'Message de la discussion',
    example: 'Pouvez-vous préciser les dates exactes ?',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    description: 'Heure du message',
    example: '14:30',
    required: false,
  })
  @IsString()
  @IsOptional()
  heure_message?: string;
}
