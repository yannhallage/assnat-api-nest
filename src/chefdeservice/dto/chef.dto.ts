import { IsNotEmpty, IsString, ValidateNested, IsOptional, IsEmail, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ChefActionDto {
    @IsString() @IsNotEmpty()
    id_personnel!: string;

    @IsString() @IsNotEmpty()
    id_service!: string;

    @IsEmail()
    email_travail?: string;
}

export class ApproveDemandeDto {
    @IsString() @IsOptional()
    commentaire?: string;

    @ValidateNested()
    @Type(() => ChefActionDto)
    chef!: ChefActionDto;
}

export class RejectDemandeDto {
    @ApiProperty({
        description: 'Motif de refus',
        example: 'Période non disponible',
    })
    @IsString()
    @IsNotEmpty()
    motif: string;

    @ValidateNested()
    @Type(() => ChefActionDto)
    chef!: ChefActionDto;
}

// export class InvitePersonnelDto {
//     @ApiProperty({
//         description: 'Nom du personnel',
//         example: 'Dupont',
//     })
//     @IsString()
//     @IsNotEmpty()
//     nom_personnel: string;

//     @ApiProperty({
//         description: 'Prénom du personnel',
//         example: 'Jean',
//     })
//     @IsString()
//     @IsNotEmpty()
//     prenom_personnel: string;

//     @ApiProperty({
//         description: 'Email de travail du personnel',
//         example: 'jean.dupont@assnat.qc.ca',
//     })
//     @IsEmail()
//     @IsNotEmpty()
//     email_travail: string;

//     @ApiProperty({
//         description: 'Email personnel',
//         example: 'jean.dupont@gmail.com',
//         required: false,
//     })
//     @IsEmail()
//     @IsOptional()
//     email_personnel?: string;

//     @ApiProperty({
//         description: 'Matricule du personnel',
//         example: 'EMP123',
//         required: false,
//     })
//     @IsString()
//     @IsOptional()
//     matricule_personnel?: string;

//     @ApiProperty({
//         description: 'Téléphone de travail',
//         example: '418-123-4567',
//         required: false,
//     })
//     @IsString()
//     @IsOptional()
//     telephone_travail?: string;

//     @ApiProperty({
//         description: 'Téléphone personnel',
//         example: '418-987-6543',
//         required: false,
//     })
//     @IsString()
//     @IsOptional()
//     telephone_personnel?: string;

//     @ApiProperty({
//         description: 'Type de personnel',
//         example: 'PERMANENT',
//         enum: ['PERMANENT', 'CONTRACTUEL', 'STAGIAIRE'],
//     })
//     @IsString()
//     @IsNotEmpty()
//     type_personnel: 'PERMANENT' | 'CONTRACTUEL' | 'STAGIAIRE';
// }
