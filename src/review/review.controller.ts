import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { AuthAdminGuard } from 'src/common/guards/admin.guard';
import { CreateBookReviewDto } from './dto/create-book-review.dto';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { CreateAuthorReviewDto } from './dto/create-author-review.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @ApiOperation({ summary: 'Busca todas as reviews.' })
  @Get('/all')
  async getReview() {
    return this.reviewService.getReviews();
  }

  @ApiOperation({ summary: 'Busca todas as reviews de um determinado livro.' })
  @Get('/book/:bookId')
  async getReviewsByBook(@Param('bookId') bookId: string) {
    return this.reviewService.getBookReviews(bookId);
  }

  @ApiOperation({ summary: 'Busca todas as reviews de um determinado autor.' })
  @Get('/author/:authorId')
  async getReviewsByAuthor(@Param('authorId') authorId: string) {
    return this.reviewService.getAuthorReviews(authorId);
  }

  @Post('/book/:bookId')
  @UseGuards(AuthAdminGuard)
  @ApiOperation({
    summary: 'O usuário logado pode fazer uma review de um determinado livro.',
  })
  @ApiBearerAuth()
  async createReview(
    @Body() createReviewDto: CreateBookReviewDto,
    @Param('bookId') bookId: string,
    @GetUser('sub') userId: string,
  ) {
    return this.reviewService.createBookReview(userId, createReviewDto, bookId);
  }

  @Post('/author/:authorId')
  @UseGuards(AuthAdminGuard)
  @ApiOperation({
    summary: 'O usuário logado pode fazer uma review de um determinado autor.',
  })
  @ApiBearerAuth()
  async createAuthorReview(
    @Body() createAuthorReviewDto: CreateAuthorReviewDto,
    @Param('authorId') authorId: string,
    @GetUser('sub') userId: string,
  ) {
    return this.reviewService.createAuthorReview(
      userId,
      createAuthorReviewDto,
      authorId,
    );
  }
}
