// src/rh/dto/create-type-conge.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTypeCongeDto {
    @ApiProperty({ description: 'Libellé du type de congé', example: 'Congé annuel' })
    @IsString()
    @IsNotEmpty({ message: 'Le libellé du type de congé est obligatoire' })
    libelle_typeconge: string;

    @ApiProperty({ description: 'Indique si le type de congé est actif', example: true, required: false })
    @IsBoolean()
    @IsOptional()
    is_active?: boolean;
}
