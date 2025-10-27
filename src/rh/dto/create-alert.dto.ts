import { IsString, IsOptional } from 'class-validator';

export class CreateAlertDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  type?: string; // info, warning, critical, etc.

  @IsOptional()
  @IsString()
  target?: string; // personnel, service, direction
}
