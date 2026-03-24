import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { LoanService } from './loan.service';
import { CreateLoanDto } from './dto/create-loan';
import { AuthAdminGuard } from 'src/common/guards/admin.guard';

@Controller('loan')
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  @Post()
  @UseGuards(AuthAdminGuard)
  async createLoan(@Body() createLoanDto: CreateLoanDto) {
    return this.loanService.createLoan(createLoanDto);
  }
}
