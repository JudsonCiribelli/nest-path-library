import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAuthorDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  bio?: string;

  @IsString()
  @IsNotEmpty()
  birthDate!: Date;
}
