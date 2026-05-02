import { Module } from '@nestjs/common';
import { TransactionsModule } from '../transactions/transactions.module';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [TransactionsModule],
  controllers: [DashboardController],
})
export class DashboardModule {}
