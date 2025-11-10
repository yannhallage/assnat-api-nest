import { IsNotEmpty, IsString, IsOptional, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDemandeDto {
  @ApiProperty({ description: 'Type de la demande', example: 'Congé annuel' })
  @IsString()
  @IsNotEmpty({ message: 'Le type de demande est obligatoire' })
  type_demande: string;

  @ApiPropertyOptional({ description: 'Motif de la demande', example: 'Vacances familiales' })
  @IsString()
  @IsOptional()
  motif?: string;

  // @ApiPropertyOptional({ description: 'ID du service associé', example: 'uuid-service' })
  // @IsString()
  // @IsOptional()
  // id_service?: string;

  @ApiPropertyOptional({ description: 'ID de la période de congé associée', example: 'uuid-periode' })
  @IsString()
  @IsOptional()
  id_periodeconge?: string;

  // @ApiPropertyOptional({ description: 'ID du chef de service responsable', example: 'uuid-chef' })
  // @IsString()
  // @IsOptional()
  // id_chef_service?: string;

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

// export class CreatePeriodeCongeDto {
//   @ApiProperty({
//     description: 'Date de début du congé',
//     example: '2024-07-01',
//   })
//   @IsDateString()
//   @IsNotEmpty()
//   date_debut: string;

//   @ApiProperty({
//     description: 'Date de fin du congé',
//     example: '2024-07-15',
//   })
//   @IsDateString()
//   @IsNotEmpty()
//   date_fin: string;

//   @ApiProperty({
//     description: 'Nombre de jours de congé',
//     example: 10,
//   })
//   @IsNotEmpty()
//   nb_jour: number;

//   @ApiProperty({
//     description: 'ID du type de congé',
//     example: 'uuid-du-type-conge',
//   })
//   @IsUUID()
//   @IsNotEmpty()
//   id_typeconge: string;
// }

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
