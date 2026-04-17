import { PrismaService } from '@/prisma/prisma.service';
import { LoanService } from './loan.service';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateLoanDto } from './dto/create-loan';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

describe('Loans', () => {
  let prismaService: PrismaService;
  let loanService: LoanService;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
    },
    book: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    loan: {
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    $transaction: jest.fn().mockImplementation(async (callback) => {
      return await callback(prismaMock);
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoanService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    loanService = module.get<LoanService>(LoanService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockUserId = '123-ABC';
  const mockBookId = '456-DEF';

  const mockCreateLoanDto: CreateLoanDto = {
    bookId: mockBookId,
    userId: mockUserId,
  } as any;
  const mockTokenPayload = {
    sub: mockUserId,
    role: 'CLIENT',
    email: 'teste@teste.com',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    aud: 'minha-biblioteca',
    iss: 'auth-service',
  };
  const mockUser = {
    id: mockUserId,
    name: 'Judson',
    email: 'teste@teste.com',
  };
  const mockBook = {
    id: mockBookId,
    title: 'Clean Code',
    status: 'AVAILABLE',
  };
  const mockLoan = {
    id: 'loan-789',
    userId: mockUserId,
    bookId: mockBookId,
    dueDate: new Date(),
    returnDate: Date.now(),
  };

  describe('POST', () => {
    it('should be defined loans service', () => {
      expect(loanService).toBeDefined();
      expect(prismaService).toBeDefined();
    });

    it('should create a new loan', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      prismaMock.book.findUnique.mockResolvedValue(mockBook);
      prismaMock.loan.create.mockResolvedValue(mockLoan);
      prismaMock.book.update.mockResolvedValue({
        ...mockBook,
        status: 'BORROWED',
      });

      const response = await loanService.createLoan(
        mockCreateLoanDto,
        mockUserId,
        mockTokenPayload,
      );

      expect(response).toEqual(mockLoan);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
      });
      expect(prismaMock.book.findUnique).toHaveBeenCalledWith({
        where: { id: mockBookId },
      });
      expect(prismaMock.loan.create).toHaveBeenCalled();
      expect(prismaMock.book.update).toHaveBeenCalledWith({
        where: {
          id: mockBookId,
        },
        data: {
          status: 'BORROWED',
        },
      });
    });

    it('should return notFoundException with user doest found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      await expect(
        loanService.createLoan(
          mockCreateLoanDto,
          mockUserId,
          mockTokenPayload as any,
        ),
      ).rejects.toThrow(NotFoundException);
      expect(prismaMock.book.findUnique).not.toHaveBeenCalled();
    });

    it('should return ConflictException with user id be diferent than Token', async () => {
      const wrongUser = { id: 'hacker-999', name: 'Invasor' };
      prismaMock.user.findUnique.mockResolvedValue(wrongUser);

      await expect(
        loanService.createLoan(
          mockCreateLoanDto,
          mockUserId,
          mockTokenPayload as any,
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('should return ConflictException with book is on loan', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      prismaMock.book.findUnique.mockResolvedValue({
        ...mockBook,
        status: 'BORROWED',
      });

      await expect(
        loanService.createLoan(
          mockCreateLoanDto,
          mockUserId,
          mockTokenPayload as any,
        ),
      ).rejects.toThrow(ConflictException);

      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('PATCH', () => {
    it('should update book status', async () => {
      const mockLoanId = 'loan-123';
      const mockUserId = 'user-456';
      const mockBookId = 'book-789';

      const mockLoan = {
        id: mockLoanId,
        userId: mockUserId,
        bookId: mockBookId,
        returnDate: null,
      };

      prismaMock.loan.findUnique.mockResolvedValue(mockLoan);

      prismaMock.loan.update.mockResolvedValue({
        ...mockLoan,
        returnDate: new Date(),
      });

      prismaMock.book.update.mockResolvedValue({
        id: mockBookId,
        status: 'AVAILABLE',
      });

      await loanService.updateBookStatus(mockLoanId, mockUserId);

      expect(prismaMock.loan.findUnique).toHaveBeenCalledWith({
        where: { id: mockLoanId },
      });

      expect(prismaMock.loan.update).toHaveBeenCalledWith({
        where: { id: mockLoanId },
        data: { returnDate: expect.any(Date) },
      });

      expect(prismaMock.book.update).toHaveBeenCalledWith({
        where: { id: mockBookId },
        data: { status: 'AVAILABLE' },
      });
    });

    it('should return ForbiddenException with user id be diferent than Token', async () => {
      const mockLoanId = 'loan-123';
      const realOwnerId = 'user-456';
      const hackerUserId = 'hacker-999';

      const mockLoan = {
        id: mockLoanId,
        userId: realOwnerId,
        bookId: 'book-789',
        returnDate: null,
      };

      prismaMock.loan.findUnique.mockResolvedValue(mockLoan);

      await expect(
        loanService.updateBookStatus(mockLoanId, hackerUserId),
      ).rejects.toThrow(ForbiddenException);

      expect(prismaMock.loan.update).not.toHaveBeenCalled();
      expect(prismaMock.book.update).not.toHaveBeenCalled();
    });

    it('should return ConflictException with loan has return Date', async () => {
      const mockLoanId = 'loan-123';
      const realOwnerId = 'user-456';
      const mockLoan = {
        id: mockLoanId,
        userId: realOwnerId,
        bookId: 'book-789',
        returnDate: '318319917',
      };

      prismaMock.loan.findUnique.mockResolvedValue(mockLoan);

      await expect(
        loanService.updateBookStatus(mockLoanId, realOwnerId),
      ).rejects.toThrow(ConflictException);

      expect(prismaMock.loan.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });
  });
});
