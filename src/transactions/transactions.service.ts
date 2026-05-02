import { Injectable } from '@nestjs/common';
import { MembershipsService } from '../memberships/memberships.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ListTransactionsQueryDto } from './dto/list-transactions-query.dto';
import { TransactionsRepository } from './transactions.repository';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionsRepository: TransactionsRepository,
    private readonly membershipsService: MembershipsService,
  ) {}

  async createTransaction(
    userId: string,
    companyId: string,
    payload: CreateTransactionDto,
  ) {
    await this.membershipsService.assertCompanyMember(userId, companyId);

    return this.transactionsRepository.createAndSave({
      companyId,
      amount: payload.amount,
      type: payload.type,
      description: payload.description,
      createdByUserId: userId,
    });
  }

  async listTransactions(
    userId: string,
    companyId: string,
    query: ListTransactionsQueryDto,
  ) {
    await this.membershipsService.assertCompanyMember(userId, companyId);

    return this.transactionsRepository.listByCompany({
      companyId,
      page: query.page,
      limit: query.limit,
      type: query.type,
    });
  }

  async getDashboardTotals(userId: string, companyId: string) {
    await this.membershipsService.assertCompanyMember(userId, companyId);
    return this.transactionsRepository.getCompanyTotals(companyId);
  }
}
