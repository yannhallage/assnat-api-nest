import { IsString, IsDate, IsInt } from 'class-validator';

export class CreatePeriodeCongeDto {
  @IsDate()
  date_debut: Date;

  @IsDate()
  date_fin: Date;

  @IsInt()
  nb_jour: number;

  @IsString()
  id_typeconge: string;
}
