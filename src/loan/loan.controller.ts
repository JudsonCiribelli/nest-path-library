import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { LoanService } from './loan.service';
import { CreateLoanDto } from './dto/create-loan';
import { AuthAdminGuard } from 'src/common/guards/admin.guard';
import { GetUser } from 'src/common/decorator/get-user.decorator';

@Controller('loan')
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  @Get('my-actives')
  @UseGuards(AuthAdminGuard)
  async listUserLoans(@GetUser('sub') userId: string) {
    return this.loanService.listUserLoans(userId);
  }

  @Post()
  @UseGuards(AuthAdminGuard)
  async createLoan(
    @Body() createLoanDto: CreateLoanDto,
    @GetUser('sub') userId: string,
  ) {
    return this.loanService.createLoan(createLoanDto, userId);
  }
}
