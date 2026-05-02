import { ForbiddenException, Injectable } from '@nestjs/common';
import { CompanyRole } from '../common/enums/company-role.enum';
import { MembershipsRepository } from './memberships.repository';

@Injectable()
export class MembershipsService {
  constructor(private readonly membershipsRepository: MembershipsRepository) {}

  async assignRole(userId: string, companyId: string, role: CompanyRole) {
    return this.membershipsRepository.upsertMembership(userId, companyId, role);
  }

  async assertCompanyMember(userId: string, companyId: string) {
    const membership = await this.membershipsRepository.findMembership(
      userId,
      companyId,
    );

    if (!membership) {
      throw new ForbiddenException('You cannot access this company');
    }

    return membership;
  }

  async assertCompanyOwner(userId: string, companyId: string) {
    const membership = await this.assertCompanyMember(userId, companyId);

    if (membership.role !== CompanyRole.OWNER) {
      throw new ForbiddenException(
        'Only company owners can perform this action',
      );
    }

    return membership;
  }
}
