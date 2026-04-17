import { Module } from '@nestjs/common';
import { AuthorService } from './author.service';
import { AuthorController } from './author.controller';

import { APP_FILTER } from '@nestjs/core';
import { ApiExceptionFilters } from '@/common/filters/exception-filters';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AuthorController],
  providers: [
    AuthorService,
    { provide: APP_FILTER, useClass: ApiExceptionFilters },
  ],
})
export class AuthorModule {}
