import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateBookReviewDto } from './dto/create-book-review.dto';
import { CreateAuthorReviewDto } from './dto/create-author-review.dto';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async getReviews() {
    const reviews = await this.prisma.review.findMany();

    if (reviews.length === 0) {
      throw new HttpException(
        'Erro ao buscar avaliações!',
        HttpStatus.BAD_REQUEST,
      );
    }

    return reviews;
  }

  async createBookReview(
    userId: string,
    createReviewDto: CreateBookReviewDto,
    bookId: string,
  ) {
    const bookExists = await this.prisma.book.findUnique({
      where: {
        id: bookId,
      },
      include: {
        author: true,
      },
    });

    if (!bookExists) {
      throw new NotFoundException('Livro não encontrado!');
    }

    try {
      return await this.prisma.review.create({
        data: {
          userId,
          stars: createReviewDto.stars,
          bookId: bookId,
          comment: createReviewDto.comment,
          authorId: bookExists.author.id,
        },
      });
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Erro ao criar avaliação!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getBookReviews(bookId: string) {
    return await this.prisma.book.findUnique({
      where: {
        id: bookId,
      },
      select: {
        reviews: true,
      },
    });
  }

  async createAuthorReview(
    userId: string,
    createAuthorReviewDto: CreateAuthorReviewDto,
    authorId: string,
  ) {
    const authorExists = await this.prisma.author.findUnique({
      where: {
        id: authorId,
      },
    });

    if (!authorExists) {
      throw new NotFoundException('Autor não encontrado!');
    }

    try {
      return await this.prisma.review.create({
        data: {
          userId,
          authorId: authorExists.id,
          bookId: null,
          stars: createAuthorReviewDto.stars!,
          comment: createAuthorReviewDto.comment,
        },
      });
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Erro ao criar avaliação!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getAuthorReviews(authorId: string) {
    return await this.prisma.author.findUnique({
      where: {
        id: authorId,
      },
      select: {
        reviews: true,
      },
    });
  }
}
