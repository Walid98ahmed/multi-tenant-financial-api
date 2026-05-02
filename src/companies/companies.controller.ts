import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
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
import { AddCompanyMemberDto } from './dto/add-company-member.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CompaniesService } from './companies.service';

@ApiTags('companies')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a company and assign current user as OWNER',
  })
  @ApiResponse({ status: 201 })
  createCompany(
    @CurrentUser() user: JwtPayload,
    @Body() payload: CreateCompanyDto,
  ) {
    return this.companiesService.createCompany(user.sub, payload);
  }

  @Get()
  @ApiOperation({ summary: 'List companies current user belongs to' })
  @ApiResponse({ status: 200 })
  listMyCompanies(@CurrentUser() user: JwtPayload) {
    return this.companiesService.listForUser(user.sub);
  }

  @Post(':companyId/members')
  @ApiOperation({ summary: 'Add or update a company member (OWNER only)' })
  @ApiResponse({ status: 201 })
  addMember(
    @CurrentUser() user: JwtPayload,
    @Param('companyId', new ParseUUIDPipe()) companyId: string,
    @Body() payload: AddCompanyMemberDto,
  ) {
    return this.companiesService.addMember(user.sub, companyId, payload);
  }
}
