import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { hash } from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(createUserDto: CreateUserDto) {
    const passwordHash = await hash(createUserDto.password, 8);

    createUserDto.password = passwordHash;

    try {
      const user = await this.prisma.user.create({
        data: createUserDto,
        select: {
          name: true,
          email: true,
          createdAt: true,
        },
      });

      return user;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Falha ao cadastrar usuário!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteUser(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: id,
        },
      });

      if (!user) {
        throw new HttpException(
          'Usuário não encontrado!',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.prisma.user.delete({
        where: {
          id: user.id,
        },
      });

      return 'Usuário deletado com sucesso!';
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Falha ao deletar usuário!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    try {
      const userExist = await this.prisma.user.findUnique({
        where: {
          id: id,
        },
      });

      if (!userExist) {
        throw new HttpException(
          'Usuário não encontrado!',
          HttpStatus.NOT_FOUND,
        );
      }

      const updatedUser = await this.prisma.user.update({
        where: {
          id: userExist.id,
        },
        data: updateUserDto,
        select: {
          name: true,
          email: true,
          createdAt: true,
        },
      });

      return updatedUser;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Falha ao atualizar usuário!',
        HttpStatus.BAD_REQUEST,
      );
    }
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

  async updateBookStatus(loanId: string) {
    try {
      const loan = await this.prisma.loan.findUnique({
        where: {
          id: loanId,
        },
        include: {
          book: true,
        },
      });

      if (!loan) {
        throw new HttpException(
          'Empréstimo não encontrado',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.prisma.loan.update({
        where: {
          id: loan.id,
        },
        data: {
          returnDate: new Date(Date.now()),
        },
      });

      await this.prisma.book.update({
        where: {
          id: loan.bookId,
        },
        data: {
          status: 'AVAILABLE',
        },
      });

      return 'Livro devolvido com sucesso!';
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error ao atualizar status do livro',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
