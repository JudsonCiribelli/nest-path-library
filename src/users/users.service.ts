import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { HashingServiceProtocol } from 'src/auth/hash/hashing.service';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private readonly hashingService: HashingServiceProtocol,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const passwordHash = await this.hashingService.hash(createUserDto.password);
    try {
      const user = await this.prisma.user.create({
        data: {
          name: createUserDto.name,
          email: createUserDto.email,
          phone: createUserDto.phone,
          password: passwordHash,
        },
        select: {
          name: true,
          email: true,
          phone: true,
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

  async getUserProfile(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          name: true,
          email: true,
          phone: true,
          loans: true,
          createdAt: true,
        },
      });

      return user;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Falha ao buscar perfil do usuário!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteUser(id: string, tokenPayload: TokenPayloadDto) {
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

      if (user.id !== tokenPayload.sub) {
        throw new ConflictException(
          'Você não tem permissão para deletar este usuário!',
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

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
    tokenPayload: TokenPayloadDto,
  ) {
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

      if (userExist.id !== tokenPayload.sub) {
        throw new ConflictException(
          'Você não tem permissão para atualizar este usuário!',
        );
      }

      const dataUser: {
        name?: string;
        email?: string;
        phone?: string;
        password?: string;
      } = {
        name: updateUserDto.name,
        email: updateUserDto.email,
        phone: updateUserDto.phone,
      };

      if (updateUserDto.password) {
        const passwordHash = await this.hashingService.hash(
          updateUserDto.password,
        );
        dataUser[`password`] = passwordHash;
      }

      const updatedUser = await this.prisma.user.update({
        where: {
          id: userExist.id,
        },
        data: {
          name: dataUser.name,
          email: dataUser.email,
          phone: dataUser.phone,
          password: dataUser?.password
            ? dataUser?.password
            : userExist.password,
        },
        select: {
          name: true,
          email: true,
          phone: true,
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
