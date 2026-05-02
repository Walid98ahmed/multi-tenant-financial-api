import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyRole } from '../common/enums/company-role.enum';
import { UserCompany } from './entities/user-company.entity';

@Injectable()
export class MembershipsRepository {
  constructor(
    @InjectRepository(UserCompany)
    private readonly membershipsRepository: Repository<UserCompany>,
  ) {}

  async upsertMembership(
    userId: string,
    companyId: string,
    role: CompanyRole,
  ): Promise<UserCompany> {
    const membership = this.membershipsRepository.create({
      userId,
      companyId,
      role,
    });

    return this.membershipsRepository.save(membership);
  }

  async findMembership(
    userId: string,
    companyId: string,
  ): Promise<UserCompany | null> {
    return this.membershipsRepository.findOne({ where: { userId, companyId } });
  }
}
