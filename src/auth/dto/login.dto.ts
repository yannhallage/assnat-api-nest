import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
    @ApiProperty({
        example: 'jean.dupont@example.com',
        description: 'Adresse e-mail du personnel',
    })
    @IsEmail({}, { message: 'L’adresse e-mail doit être valide.' })
    email_travail: string;

    @ApiProperty({
        example: 'MotDePasse123!',
        description: 'Mot de passe du compte personnel',
    })
    @IsString()
    @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères.' })
    password: string;
}
