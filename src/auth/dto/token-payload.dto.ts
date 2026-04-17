import { IsInt, IsString } from 'class-validator';

export class TokenPayloadDto {
  @IsString()
  sub?: string;
  @IsString()
  email?: string;
  @IsString()
  role?: string;
  @IsInt()
  iat?: number;
  @IsInt()
  exp?: number;
  @IsString()
  aud?: string;
  @IsString()
  iss?: string;
}
