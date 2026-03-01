import { Module } from '@nestjs/common';
import { AuthorService } from './author.service';
import { AuthorController } from './author.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { APP_FILTER } from '@nestjs/core';
import { ApiExceptionFilters } from 'src/common/filters/exception-filters';

@Module({
  imports: [PrismaModule],
  controllers: [AuthorController],
  providers: [
    AuthorService,
    { provide: APP_FILTER, useClass: ApiExceptionFilters },
  ],
})
export class AuthorModule {}
