import { IsString, IsOptional } from 'class-validator';

export class CreateDemandeDto {
  @IsString()
  type_demande: string;

  @IsOptional()
  @IsString()
  motif?: string;

  @IsString()
  id_personnel: string;

  @IsOptional()
  @IsString()
  id_service?: string;
}
