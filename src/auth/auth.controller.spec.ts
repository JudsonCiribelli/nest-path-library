import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('Auth Controller', () => {
  let authController: AuthController;

  const mockAuthService = {
    SignInUser: jest.fn(),
    SignOutUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  it('should pass login credentials to the service and return a token (O Garçom do Login)', async () => {
    const loginDto = {
      email: 'judson@teste.com',
      password: 'senhaSuperSecreta',
    };

    const expectedResponse = {
      token: 'ey-token-super-seguro',
      user: {
        name: 'Judson',
        email: 'judson@teste.com',
        role: 'USER',
      },
    };

    mockAuthService.SignInUser.mockResolvedValue(expectedResponse);

    const result = await authController.signIn(loginDto);

    expect(result).toEqual(expectedResponse);

    expect(mockAuthService.SignInUser).toHaveBeenCalledWith(loginDto);
  });
});
