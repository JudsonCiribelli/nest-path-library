import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @IsString()
  @IsNotEmpty()
  readonly description: string;

  @IsString()
  @IsNotEmpty()
  readonly authorId: string;

  @IsString()
  @IsNotEmpty()
  readonly categoryId: string;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  readonly pages: number;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  readonly year: number;
}
