import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { AuthAdminGuard } from 'src/common/guards/admin.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { GetUser } from 'src/common/decorator/get-user.decorator';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get('/all')
  @UseGuards(AuthAdminGuard)
  async getReview() {
    return this.reviewService.getReviews();
  }

  @Post('/book/:bookId')
  @UseGuards(AuthAdminGuard)
  async createReview(
    @Body() createReviewDto: CreateReviewDto,
    @Param('bookId') bookId: string,
    @GetUser('sub') userId: string,
  ) {
    return this.reviewService.createReview(userId, createReviewDto, bookId);
  }
}
