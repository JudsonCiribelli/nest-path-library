import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @IsNumber()
  @Min(0)
  @Max(5)
  readonly stars: number;

  @IsString()
  @IsOptional()
  readonly comment?: string;
}
