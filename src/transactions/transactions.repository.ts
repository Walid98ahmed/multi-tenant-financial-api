import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionType } from '../common/enums/transaction-type.enum';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class TransactionsRepository {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
  ) {}

  async createAndSave(payload: {
    companyId: string;
    amount: string;
    type: TransactionType;
    description?: string;
    createdByUserId: string;
  }) {
    const transaction = this.transactionsRepository.create(payload);
    return this.transactionsRepository.save(transaction);
  }

  async listByCompany(payload: {
    companyId: string;
    page: number;
    limit: number;
    type?: TransactionType;
  }) {
    const { companyId, page, limit, type } = payload;

    const query = this.transactionsRepository
      .createQueryBuilder('transaction')
      .where('transaction.companyId = :companyId', { companyId })
      .orderBy('transaction.createdAt', 'DESC')
      .addOrderBy('transaction.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (type) {
      query.andWhere('transaction.type = :type', { type });
    }

    const [items, totalItems] = await query.getManyAndCount();
    const totalPages = Math.ceil(totalItems / limit) || 1;

    return {
      items,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    };
  }

  async getCompanyTotals(companyId: string) {
    const result = await this.transactionsRepository
      .createQueryBuilder('transaction')
      .select(
        `COALESCE(SUM(CASE WHEN transaction.type = :revenue THEN transaction.amount ELSE 0 END), 0)`,
        'totalRevenue',
      )
      .addSelect(
        `COALESCE(SUM(CASE WHEN transaction.type = :expense THEN transaction.amount ELSE 0 END), 0)`,
        'totalExpenses',
      )
      .where('transaction.companyId = :companyId', { companyId })
      .setParameters({
        revenue: TransactionType.REVENUE,
        expense: TransactionType.EXPENSE,
      })
      .getRawOne<{ totalRevenue: string; totalExpenses: string }>();

    return {
      totalRevenue: result?.totalRevenue ?? '0',
      totalExpenses: result?.totalExpenses ?? '0',
    };
  }
}
