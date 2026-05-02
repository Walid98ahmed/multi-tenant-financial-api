import { Injectable, NotFoundException } from '@nestjs/common';
import { CompanyRole } from '../common/enums/company-role.enum';
import { MembershipsService } from '../memberships/memberships.service';
import { UsersService } from '../users/users.service';
import { AddCompanyMemberDto } from './dto/add-company-member.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CompaniesRepository } from './companies.repository';

@Injectable()
export class CompaniesService {
  constructor(
    private readonly companiesRepository: CompaniesRepository,
    private readonly membershipsService: MembershipsService,
    private readonly usersService: UsersService,
  ) {}

  async createCompany(ownerUserId: string, payload: CreateCompanyDto) {
    const company = await this.companiesRepository.createAndSave(
      payload.name.trim(),
    );

    await this.membershipsService.assignRole(
      ownerUserId,
      company.id,
      CompanyRole.OWNER,
    );

    return company;
  }

  async listForUser(userId: string) {
    return this.companiesRepository.findByUserId(userId);
  }

  async addMember(
    actingUserId: string,
    companyId: string,
    payload: AddCompanyMemberDto,
  ) {
    await this.membershipsService.assertCompanyOwner(actingUserId, companyId);

    const company = await this.companiesRepository.findById(companyId);
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    await this.usersService.getByIdOrThrow(payload.userId);

    return this.membershipsService.assignRole(
      payload.userId,
      companyId,
      payload.role,
    );
  }
}
