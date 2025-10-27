import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  code_service: string;

  @IsString()
  nom_service: string;

  @IsOptional()
  @IsInt()
  nb_personnel?: number;

  @IsString()
  id_direction: string;
}
