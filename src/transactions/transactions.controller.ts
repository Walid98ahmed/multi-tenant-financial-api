import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ListTransactionsQueryDto } from './dto/list-transactions-query.dto';
import { TransactionsService } from './transactions.service';

@ApiTags('transactions')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('companies/:companyId/transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create transaction for a company' })
  @ApiResponse({ status: 201 })
  createTransaction(
    @CurrentUser() user: JwtPayload,
    @Param('companyId', new ParseUUIDPipe()) companyId: string,
    @Body() payload: CreateTransactionDto,
  ) {
    return this.transactionsService.createTransaction(
      user.sub,
      companyId,
      payload,
    );
  }

  @Get()
  @ApiOperation({ summary: 'List company transactions with pagination' })
  @ApiResponse({ status: 200 })
  listTransactions(
    @CurrentUser() user: JwtPayload,
    @Param('companyId', new ParseUUIDPipe()) companyId: string,
    @Query() query: ListTransactionsQueryDto,
  ) {
    return this.transactionsService.listTransactions(
      user.sub,
      companyId,
      query,
    );
  }
}
