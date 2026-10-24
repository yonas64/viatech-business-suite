import { RegisterUserDto } from './dto/register-user.dto';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  const authService = {
    register: jest.fn(),
    login: jest.fn(),
  };
  const controller = new AuthController(authService as unknown as AuthService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('always registers public accounts as staff', async () => {
    authService.register.mockResolvedValue({ role: 'staff' });
    const registerDto: RegisterUserDto = {
      name: 'Business Owner',
      username: 'owner',
      email: 'owner@example.com',
      password: 'secret123',
      role: 'admin',
    };

    await controller.register(registerDto);

    expect(authService.register).toHaveBeenCalledWith(registerDto);
    expect(registerDto.role).toBe('staff');
  });
});
