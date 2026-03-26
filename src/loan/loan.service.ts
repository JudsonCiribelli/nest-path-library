import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLoanDto } from './dto/create-loan';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';

@Injectable()
export class LoanService {
  constructor(private prisma: PrismaService) {}

  async createLoan(
    createLoanDto: CreateLoanDto,
    userId: string,
    tokenPayload: TokenPayloadDto,
  ) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.id !== tokenPayload.sub) {
      throw new ConflictException('Token inválido para o usuário autenticado');
    }

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

  async listUserLoans(userId: string, tokenPayload: TokenPayloadDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.id !== tokenPayload.sub) {
      throw new ConflictException('Token inválido para o usuário autenticado');
    }

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

  async listAllUserLoans(userId: string, tokenPayload: TokenPayloadDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.id !== tokenPayload.sub) {
      throw new ConflictException('Token inválido para o usuário autenticado');
    }

    return this.prisma.loan.findMany({
      where: {
        userId,
        returnDate: null,
      },
      include: {
        book: {
          select: {
            title: true,
            description: true,
            pages: true,
            year: true,
            category: true,
            author: true,
          },
        },
      },
    });
  }

  async getUserLoan(userId: string) {
    try {
      const userLoans = await this.prisma.loan.findMany({
        where: {
          userId: userId,
        },
        include: {
          book: true,
        },
        orderBy: {
          dueDate: 'asc',
        },
      });

      return userLoans;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error ao buscar empréstimos do usuário',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateBookStatus(loanId: string, userId: string) {
    const loan = await this.prisma.loan.findUnique({
      where: {
        id: loanId,
      },
    });

    if (!loan) {
      throw new NotFoundException('Empréstimo não encontrado');
    }

    if (loan.userId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para devolver este livro.',
      );
    }

    if (loan.returnDate !== null) {
      throw new ConflictException('Este livro já foi devolvido anteriormente.');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const updatedLoan = await tx.loan.update({
          where: { id: loanId },
          data: { returnDate: new Date() },
        });

        await tx.book.update({
          where: { id: loan.bookId },
          data: { status: 'AVAILABLE' },
        });

        return updatedLoan;
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Não foi possível processar a devolução.',
      );
    }
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
