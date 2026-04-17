import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LoanService } from './loan.service';
import { CreateLoanDto } from './dto/create-loan';
import { AuthAdminGuard } from '@/common/guards/admin.guard';
import { GetUser } from '@/common/decorator/get-user.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorator/roles.decorator';
import { tokenPayloadParam } from '@/auth/param/token-payload.param';
import { TokenPayloadDto } from '@/auth/dto/token-payload.dto';
import { AuthTokenGuard } from '@/auth/guard/auth-token.guard';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@Controller('loan')
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  @Get('my-actives')
  @UseGuards(AuthAdminGuard)
  @ApiOperation({
    summary: 'Busca todos os livros que estão alugados do usuário logado.',
  })
  @ApiBearerAuth()
  async listUserLoans(
    @GetUser('sub') userId: string,
    @tokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.loanService.listUserLoans(userId, tokenPayload);
  }

  @Get('my-history')
  @UseGuards(AuthAdminGuard)
  @ApiOperation({
    summary: 'Retorna todos os livros que estão alugados com o usuário logado.',
  })
  @ApiBearerAuth()
  async listAllUserLoans(
    @GetUser('sub') userId: string,
    @tokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.loanService.listAllUserLoans(userId, tokenPayload);
  }

  @Get('loans')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Listas todos os livros alugados com todos os usuário. (ADMIN)',
  })
  @UseGuards(AuthAdminGuard, RolesGuard)
  async listAllLoans() {
    return this.loanService.loans();
  }

  @Post()
  @UseGuards(AuthTokenGuard)
  @ApiOperation({
    summary: 'O usuário logado pode alugar um livro.',
  })
  @ApiBearerAuth()
  async createLoan(
    @Body() createLoanDto: CreateLoanDto,
    @GetUser('sub') userId: string,
    @tokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.loanService.createLoan(createLoanDto, userId, tokenPayload);
  }

  @Patch(':loanId/return')
  @UseGuards(AuthTokenGuard)
  @ApiOperation({
    summary: 'O usuário devolve o livro alugado anteriormente.',
  })
  @ApiBearerAuth()
  async updateBookStatus(
    @Param('loanId') loanId: string,
    @GetUser('sub') userId: string,
  ) {
    return this.loanService.updateBookStatus(loanId, userId);
  }
}
