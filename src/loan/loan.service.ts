import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLoanDto } from './dto/create-loan';

@Injectable()
export class LoanService {
  constructor(private prisma: PrismaService) {}

  async createLoan(createLoanDto: CreateLoanDto, userId: string) {
    const book = await this.prisma.book.findUnique({
      where: {
        id: createLoanDto.bookId,
      },
    });

    if (!book) {
      throw new NotFoundException('Livro não encontrado');
    }

    if (book.status === 'BORROWED') {
      throw new ConflictException('Livro já emprestado');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const loan = await tx.loan.create({
          data: {
            userId: userId,
            bookId: book.id,
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 dias
          },
        });

        await tx.book.update({
          where: { id: book.id },
          data: { status: 'BORROWED' },
        });

        return loan;
      });
    } catch (error) {
      console.error('Erro na transação de empréstimo:', error);
      throw new BadRequestException('Não foi possível processar o empréstimo.');
    }
  }

  async listUserLoans(userId: string) {
    return this.prisma.loan.findMany({
      where: {
        userId,
      },
      include: {
        book: {
          select: {
            title: true,
            description: true,
            pages: true,
            year: true,
            author: { select: { name: true } },
            category: { select: { name: true } },
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async listAllUserLoans(userId: string) {
    return this.prisma.loan.findMany({
      where: {
        userId,
      },
    });
  }

  async loans() {
    return this.prisma.loan.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        book: {
          select: {
            title: true,
            description: true,
            pages: true,
            year: true,
            author: { select: { name: true } },
            category: { select: { name: true } },
          },
        },
      },
    });
  }
}
