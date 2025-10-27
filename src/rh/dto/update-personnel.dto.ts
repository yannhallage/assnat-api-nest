import { IsNotEmpty, IsString, IsOptional, IsEmail, IsUUID, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


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