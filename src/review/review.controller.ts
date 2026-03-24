import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { AuthAdminGuard } from 'src/common/guards/admin.guard';
import { CreateBookReviewDto } from './dto/create-book-review.dto';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreateAuthorReviewDto } from './dto/create-author-review.dto';
import { create } from 'domain';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get('/all')
  @UseGuards(AuthAdminGuard)
  async getReview() {
    return this.reviewService.getReviews();
  }

  @Get('/book/:bookId')
  async getReviewsByBook(@Param('bookId') bookId: string) {
    return this.reviewService.getBookReviews(bookId);
  }

  @Post('/book/:bookId')
  @UseGuards(AuthAdminGuard)
  async createReview(
    @Body() createReviewDto: CreateBookReviewDto,
    @Param('bookId') bookId: string,
    @GetUser('sub') userId: string,
  ) {
    return this.reviewService.createBookReview(userId, createReviewDto, bookId);
  }

  @Post('/author/:authorId')
  @UseGuards(AuthAdminGuard)
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
