import { Test, TestingModule } from '@nestjs/testing';
import { LoanController } from './loan.controller';
import { LoanService } from './loan.service';
import { AuthTokenGuard } from '@/auth/guard/auth-token.guard';
import { AuthAdminGuard } from '@/common/guards/admin.guard';
import { RolesGuard } from '@/common/guards/roles.guard';

describe('Loan Controller', () => {
  let loanController: LoanController;
  const mockLoanService = {
    createLoan: jest.fn(),
    updateBookStatus: jest.fn(),
  };

  beforeEach(async () => {
    const mockGuard = {
      canActivate: jest.fn(() => true),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoanController],
      providers: [
        {
          provide: LoanService,
          useValue: mockLoanService,
        },
      ],
    })
      .overrideGuard(AuthTokenGuard)
      .useValue(mockGuard)
      .overrideGuard(AuthAdminGuard)
      .useValue(mockGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockGuard)
      .compile();

    loanController = module.get<LoanController>(LoanController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(loanController).toBeDefined();
  });

  it('should create a new loan (Garçom repassando o pedido)', async () => {
    const userId = 'user-456';
    const createLoanDto = { bookId: 'book-123', userId: userId };
    const tokenPayload = {
      sub: 'user-456',
      email: 'judson@teste.com',
      role: 'USER',
    };

    const expectedLoan = {
      id: 'loan-789',
      userId: userId,
      bookId: 'book-123',
      dueDate: new Date(),
    };

    mockLoanService.createLoan.mockResolvedValue(expectedLoan);

    const result = await loanController.createLoan(
      createLoanDto,
      userId,
      tokenPayload as any,
    );

    expect(result).toEqual(expectedLoan);

    expect(mockLoanService.createLoan).toHaveBeenCalledWith(
      createLoanDto,
      userId,
      tokenPayload,
    );
  });

  it('should update loan status (Garçom repassando a devolução)', async () => {
    const loanId = 'loan-123';
    const userId = 'user-456';

    const expectedResponse = {
      message: 'Livro devolvido com sucesso',
      loanId: loanId,
      returnDate: new Date(),
    };

    mockLoanService.updateBookStatus.mockResolvedValue(expectedResponse);

    const result = await loanController.updateBookStatus(loanId, userId);

    expect(result).toEqual(expectedResponse);
    expect(mockLoanService.updateBookStatus).toHaveBeenCalledWith(
      loanId,
      userId,
    );
  });
});
