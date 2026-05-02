import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
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
import { TransactionsService } from '../transactions/transactions.service';

@ApiTags('dashboard')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('companies/:companyId/dashboard')
export class DashboardController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get revenue/expense totals for a company' })
  @ApiResponse({ status: 200 })
  getCompanyDashboard(
    @CurrentUser() user: JwtPayload,
    @Param('companyId', new ParseUUIDPipe()) companyId: string,
  ) {
    return this.transactionsService.getDashboardTotals(user.sub, companyId);
  }
}
