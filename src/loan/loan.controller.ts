import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { LoanService } from './loan.service';
import { CreateLoanDto } from './dto/create-loan';
import { AuthAdminGuard } from 'src/common/guards/admin.guard';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorator/roles.decorator';

@Controller('loan')
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  @Get('my-actives')
  @UseGuards(AuthAdminGuard)
  async listUserLoans(@GetUser('sub') userId: string) {
    return this.loanService.listUserLoans(userId);
  }

  @Get('my-history')
  @UseGuards(AuthAdminGuard)
  async listAllUserLoans(@GetUser('sub') userId: string) {
    return this.loanService.listAllUserLoans(userId);
  }

  @Get('loans')
  @Roles('ADMIN')
  @UseGuards(AuthAdminGuard, RolesGuard)
  async listAllLoans() {
    return this.loanService.loans();
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
