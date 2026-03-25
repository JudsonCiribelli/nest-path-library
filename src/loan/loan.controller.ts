import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { LoanService } from './loan.service';
import { CreateLoanDto } from './dto/create-loan';
import { AuthAdminGuard } from 'src/common/guards/admin.guard';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorator/roles.decorator';
import { tokenPayloadParam } from 'src/auth/param/token-payload.param';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';

@Controller('loan')
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  @Get('my-actives')
  @UseGuards(AuthAdminGuard)
  async listUserLoans(
    @GetUser('sub') userId: string,
    @tokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.loanService.listUserLoans(userId, tokenPayload);
  }

  @Get('my-history')
  @UseGuards(AuthAdminGuard)
  async listAllUserLoans(
    @GetUser('sub') userId: string,
    @tokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.loanService.listAllUserLoans(userId, tokenPayload);
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
    @tokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.loanService.createLoan(createLoanDto, userId, tokenPayload);
  }
}
