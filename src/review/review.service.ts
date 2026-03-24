import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async createReview(
    userId: string,
    createReviewDto: CreateReviewDto,
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

    const review = await this.prisma.review.create({
      data: {
        userId,
        stars: createReviewDto.stars,
        bookId: bookId,
        comment: createReviewDto.comment,
        authorId: bookExists.author.id,
      },
    });

    return review;
  }

  async getReviews() {
    return this.prisma.review.findMany();
  }
}
