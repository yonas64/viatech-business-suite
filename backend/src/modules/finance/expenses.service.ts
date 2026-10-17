import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseQueryDto } from './dto/expense-query.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Expense, ExpenseDocument } from './schemas/expense.schema';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense.name)
    private readonly expenseModel: Model<ExpenseDocument>,
  ) {}

  async create(dto: CreateExpenseDto, userId: string) {
    const expense = new this.expenseModel({
      category: dto.category.trim().toLowerCase(),
      amount: dto.amount,
      description: dto.description.trim(),
      expenseDate: new Date(dto.expenseDate),
      reference: dto.reference?.trim(),
      receiptUrl: dto.receiptUrl?.trim(),
      createdBy: new Types.ObjectId(userId),
    });
    return expense.save();
  }

  async findAll(query: ExpenseQueryDto) {
    const filter: Record<string, unknown> = {};
    if (query.from && query.to && new Date(query.from) > new Date(query.to)) {
      throw new BadRequestException('from must be earlier than or equal to to');
    }
    const date = this.dateFilter(query.from, query.to);
    if (date) filter.expenseDate = date;
    if (query.category?.trim()) filter.category = query.category.trim().toLowerCase();

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [items, total, amount] = await Promise.all([
      this.expenseModel
        .find(filter)
        .populate('createdBy', 'name username email')
        .sort({ expenseDate: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.expenseModel.countDocuments(filter).exec(),
      this.expenseModel.aggregate([
        { $match: filter },
        { $group: { _id: null, amount: { $sum: '$amount' } } },
      ]),
    ]);
    return {
      items,
      total,
      amount: amount[0]?.amount ?? 0,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    this.ensureValidId(id);
    const expense = await this.expenseModel
      .findById(id)
      .populate('createdBy', 'name username email')
      .exec();
    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  async update(id: string, dto: UpdateExpenseDto) {
    this.ensureValidId(id);
    const update: Record<string, unknown> = {};
    if (dto.category !== undefined) update.category = dto.category.trim().toLowerCase();
    if (dto.amount !== undefined) update.amount = dto.amount;
    if (dto.expenseDate !== undefined) update.expenseDate = new Date(dto.expenseDate);
    if (dto.description !== undefined) update.description = dto.description.trim();
    if (dto.reference !== undefined) update.reference = dto.reference.trim();
    if (dto.receiptUrl !== undefined) update.receiptUrl = dto.receiptUrl.trim();

    const expense = await this.expenseModel
      .findByIdAndUpdate(id, update, { new: true, runValidators: true })
      .populate('createdBy', 'name username email')
      .exec();
    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  async remove(id: string) {
    this.ensureValidId(id);
    const expense = await this.expenseModel.findByIdAndDelete(id).exec();
    if (!expense) throw new NotFoundException('Expense not found');
    return { deleted: true, id };
  }

  private dateFilter(from?: string, to?: string) {
    if (!from && !to) return undefined;
    const date: Record<string, Date> = {};
    if (from) date.$gte = new Date(from);
    if (to) date.$lte = new Date(to);
    return date;
  }

  private ensureValidId(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Expense not found');
  }
}