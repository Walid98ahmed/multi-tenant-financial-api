import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';

@Injectable()
export class CompaniesRepository {
  constructor(
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
  ) {}

  async createAndSave(name: string): Promise<Company> {
    const company = this.companiesRepository.create({ name });
    return this.companiesRepository.save(company);
  }

  async findById(companyId: string): Promise<Company | null> {
    return this.companiesRepository.findOne({ where: { id: companyId } });
  }

  async findByUserId(userId: string): Promise<Company[]> {
    return this.companiesRepository
      .createQueryBuilder('company')
      .innerJoin('company.userCompanies', 'membership')
      .where('membership.userId = :userId', { userId })
      .orderBy('company.createdAt', 'DESC')
      .getMany();
  }
}
