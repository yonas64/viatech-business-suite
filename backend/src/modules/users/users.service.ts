import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { AuthService } from '../auth/auth.service';
import { RegisterUserDto } from '../auth/dto/register-user.dto';
import { User, UserDocument } from '../auth/schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';

const SAFE_USER_FIELDS = 'name username email role createdAt updatedAt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly authService: AuthService,
  ) {}

  create(createUserDto: RegisterUserDto) {
    return this.authService.register(createUserDto);
  }

  findAll() {
    return this.userModel
      .find()
      .select(SAFE_USER_FIELDS)
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string) {
    this.ensureValidId(id);
    const user = await this.userModel
      .findById(id)
      .select(SAFE_USER_FIELDS)
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    this.ensureValidId(id);
    const update: UpdateUserDto = {};
    if (updateUserDto.name !== undefined) update.name = updateUserDto.name;
    if (updateUserDto.username !== undefined) update.username = updateUserDto.username;
    if (updateUserDto.email !== undefined) update.email = updateUserDto.email;
    if (updateUserDto.role !== undefined) update.role = updateUserDto.role;
    if (update.email) update.email = update.email.trim().toLowerCase();
    if (update.username) update.username = update.username.trim();
    if (update.name) update.name = update.name.trim();

    try {
      const user = await this.userModel
        .findByIdAndUpdate(id, update, {
          new: true,
          runValidators: true,
        })
        .select(SAFE_USER_FIELDS)
        .exec();

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 11000
      ) {
        throw new ConflictException('Email or username is already in use');
      }
      throw error;
    }
  }

  async remove(id: string) {
    this.ensureValidId(id);
    const user = await this.userModel.findByIdAndDelete(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { deleted: true, id };
  }

  private ensureValidId(id: string) {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('User not found');
    }
  }
}