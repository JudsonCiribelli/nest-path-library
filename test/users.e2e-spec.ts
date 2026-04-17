import * as dotenv from 'dotenv';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { ConfigModule } from '@nestjs/config';
import { BooksModule } from '@/books/books.module';
import { CategoryModule } from '@/category/category.module';
import { AuthorModule } from '@/author/author.module';
import { UsersModule } from '@/users/users.module';
import { LoanModule } from '@/loan/loan.module';
import { AuthModule } from '@/auth/auth.module';
import { ReviewModule } from '@/review/review.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';
import { PrismaService } from '@/prisma/prisma.service';
import { execSync } from 'node:child_process';

dotenv.config({ path: '.env.test' });

describe('Users (e2e)', () => {
  let app: INestApplication<App>;
  let prismaService: PrismaService;

  beforeAll(() => {
    execSync('npx prisma migrate deploy');
  });

  beforeEach(async () => {
    execSync(
      'cross-env DATABASE_URL=file:./dev-test.db npx prisma migrate deploy',
    );

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env.test' }),
        BooksModule,
        CategoryModule,
        AuthorModule,
        UsersModule,
        LoanModule,
        AuthModule,
        ReviewModule,
        ServeStaticModule.forRoot({
          rootPath: join(process.cwd(), 'files'),
          serveRoot: '/files',
          serveStaticOptions: {
            index: false,
          },
        }),
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    prismaService = module.get<PrismaService>(PrismaService);

    await app.init();
  });

  afterEach(async () => {
    await prismaService.user.deleteMany();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/users', () => {
    it('/users POST - create user', async () => {
      const createUserDto = {
        name: 'judson rodrigues',
        email: 'judson@teste.com',
        password: '123456Aa!',
        phone: '98991973812',
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto);

      expect(response.body).toEqual({
        data: {
          name: expect.any(String),
          email: expect.any(String),
          phone: expect.any(String),
          createdAt: {},
        },
        timestamp: expect.any(String),
      });
    });

    it('/users POST - weak password', async () => {
      const createUserDto = {
        name: 'Argus rodrigues',
        email: 'argus@teste.com',
        password: '123',
        phone: '98991973812',
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(400);

      expect(response.body.message.message[0]).toEqual(
        'password is not strong enough',
      );
    });
  });
});
