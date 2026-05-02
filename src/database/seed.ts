import * as bcrypt from 'bcrypt';
import { CompanyRole } from '../common/enums/company-role.enum';
import { TransactionType } from '../common/enums/transaction-type.enum';
import { Company } from '../companies/entities/company.entity';
import { UserCompany } from '../memberships/entities/user-company.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { User } from '../users/entities/user.entity';
import { AppDataSource } from './data-source';

async function runSeed() {
  await AppDataSource.initialize();

  const userRepository = AppDataSource.getRepository(User);
  const companyRepository = AppDataSource.getRepository(Company);
  const membershipRepository = AppDataSource.getRepository(UserCompany);
  const transactionRepository = AppDataSource.getRepository(Transaction);

  const seedPassword = await bcrypt.hash('SeedPass123!', 12);

  let owner = await userRepository.findOne({
    where: { email: 'owner@acme.com' },
  });
  if (!owner) {
    owner = await userRepository.save(
      userRepository.create({
        email: 'owner@acme.com',
        name: 'Acme Owner',
        passwordHash: seedPassword,
      }),
    );
  }

  let member = await userRepository.findOne({
    where: { email: 'member@acme.com' },
  });
  if (!member) {
    member = await userRepository.save(
      userRepository.create({
        email: 'member@acme.com',
        name: 'Acme Member',
        passwordHash: seedPassword,
      }),
    );
  }

  let company = await companyRepository.findOne({
    where: { name: 'Acme Holdings' },
  });
  if (!company) {
    company = await companyRepository.save(
      companyRepository.create({
        name: 'Acme Holdings',
      }),
    );
  }

  await membershipRepository.save(
    membershipRepository.create({
      userId: owner.id,
      companyId: company.id,
      role: CompanyRole.OWNER,
    }),
  );

  await membershipRepository.save(
    membershipRepository.create({
      userId: member.id,
      companyId: company.id,
      role: CompanyRole.MEMBER,
    }),
  );

  const existingTransactionsCount = await transactionRepository.count({
    where: { companyId: company.id },
  });

  if (existingTransactionsCount === 0) {
    await transactionRepository.save([
      transactionRepository.create({
        companyId: company.id,
        amount: '12000.00',
        type: TransactionType.REVENUE,
        description: 'Annual enterprise plan payment',
        createdByUserId: owner.id,
      }),
      transactionRepository.create({
        companyId: company.id,
        amount: '3500.00',
        type: TransactionType.EXPENSE,
        description: 'Cloud infrastructure bill',
        createdByUserId: owner.id,
      }),
      transactionRepository.create({
        companyId: company.id,
        amount: '4200.00',
        type: TransactionType.REVENUE,
        description: 'Quarterly consulting invoice',
        createdByUserId: member.id,
      }),
    ]);
  }

  console.log('Seed completed successfully');
  await AppDataSource.destroy();
}

runSeed().catch(async (error) => {
  console.error('Seed failed', error);
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
  process.exit(1);
});
