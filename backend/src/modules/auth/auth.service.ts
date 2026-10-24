import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterUserDto) {
    const existingUser = await this.userModel.findOne({
      $or: [
        { email: registerDto.email.trim().toLowerCase() },
        { username: registerDto.username.trim() },
      ],
    });

    if (existingUser) {
      throw new ConflictException('User with this email or username already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const createdUser = new this.userModel({
      name: registerDto.name,
      email: registerDto.email.trim().toLowerCase(),
      username: registerDto.username.trim(),
      password: hashedPassword,
      role: registerDto.role ?? 'staff',
    });

    let savedUser: UserDocument;
    try {
      savedUser = await createdUser.save();
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 11000
      ) {
        throw new ConflictException('User with this email or username already exists');
      }
      throw error;
    }

    return {
      id: savedUser._id,
      name: savedUser.name,
      username: savedUser.username,
      email: savedUser.email,
      role: savedUser.role,
    };
  }

  async login(loginDto: LoginUserDto) {
    const emailOrUsername = loginDto.emailOrUsername.trim();
    const user = await this.userModel
      .findOne({
        $or: [
          { email: emailOrUsername.toLowerCase() },
          { username: emailOrUsername },
        ],
      })
      .select('+password');

    if (!user) {
      throw new UnauthorizedException('Invalid email/username or password');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email/username or password');
    }

    const payload = {
      sub: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  async validateUserById(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new UnauthorizedException('User account no longer exists');
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
    };
  }
}
