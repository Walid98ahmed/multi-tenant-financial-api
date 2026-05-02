import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Length, Matches } from 'class-validator';
import { TransactionType } from '../../common/enums/transaction-type.enum';

export class CreateTransactionDto {
  @ApiProperty({ example: '1250.50', description: 'Decimal amount as string' })
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'amount must be a valid positive decimal with up to 2 decimals',
  })
  amount: string;

  @ApiProperty({ enum: TransactionType, example: TransactionType.REVENUE })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({ required: false, example: 'April subscription invoices' })
  @IsOptional()
  @IsString()
  @Length(2, 500)
  description?: string;
}
