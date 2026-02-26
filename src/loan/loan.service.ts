import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLoanDto } from './dto/create-loan';

@Injectable()
export class LoanService {
  constructor(private prisma: PrismaService) {}

  async createLoan(createLoanDto: CreateLoanDto) {
    try {
      const book = await this.prisma.book.findUnique({
        where: {
          id: createLoanDto.bookId,
        },
      });

      if (!book) {
        throw new HttpException('Livro não encontrado', HttpStatus.NOT_FOUND);
      }

      const loan = await this.prisma.loan.create({
        data: {
          userId: createLoanDto.userId,
          bookId: book.id,
          dueDate: new Date(createLoanDto.dueDate),
        },
      });

      await this.prisma.book.update({
        where: {
          id: book.id,
        },
        data: {
          status: 'BORROWED',
        },
      });

      return loan;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error ao criar empréstimo',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
