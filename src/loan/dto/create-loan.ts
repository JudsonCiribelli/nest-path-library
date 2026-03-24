import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLoanDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  bookId: string;

  @IsString()
  dueDate?: Date;
}
