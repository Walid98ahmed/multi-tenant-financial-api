import { CompanyRole } from '../../common/enums/company-role.enum';
import { Company } from '../../companies/entities/company.entity';
import { User } from '../../users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

@Entity('user_companies')
@Index('idx_user_companies_user_id', ['userId'])
@Index('idx_user_companies_company_id', ['companyId'])
export class UserCompany {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId: string;

  @PrimaryColumn({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({
    type: 'enum',
    enum: CompanyRole,
    enumName: 'company_role_enum',
    default: CompanyRole.MEMBER,
  })
  role: CompanyRole;

  @ManyToOne(() => User, (user) => user.userCompanies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Company, (company) => company.userCompanies, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
