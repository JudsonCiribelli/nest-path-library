import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateBookReviewDto {
  @IsNumber()
  @Min(0)
  @Max(5)
  readonly stars: number;

  @IsString()
  @IsOptional()
  readonly comment?: string;
}
