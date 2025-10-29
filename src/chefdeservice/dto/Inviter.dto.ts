
import { IsEmail, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { TypePersonnel, RolePersonnel } from '@prisma/client';

export class InvitePersonnelDto {
    @IsEmail()
    email_personnel: string;

    @IsNotEmpty()
    nom_personnel: string;

    @IsNotEmpty()
    prenom_personnel: string;

    @IsEnum(RolePersonnel)
    @IsOptional()
    role_personnel?: RolePersonnel = RolePersonnel.EMPLOYE;

    @IsEnum(TypePersonnel)
    @IsOptional()
    type_personnel?: TypePersonnel = TypePersonnel.PERMANENT;
}
