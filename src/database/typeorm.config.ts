import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { join } from 'path';
import { Company } from '../companies/entities/company.entity';
import { UserCompany } from '../memberships/entities/user-company.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { User } from '../users/entities/user.entity';

export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const isProduction =
      configService.get<string>('NODE_ENV', 'development') === 'production';

    return {
      type: 'postgres',
      host: configService.getOrThrow<string>('DB_HOST'),
      port: configService.getOrThrow<number>('DB_PORT'),
      username: configService.getOrThrow<string>('DB_USERNAME'),
      password: configService.getOrThrow<string>('DB_PASSWORD'),
      database: configService.getOrThrow<string>('DB_NAME'),
      synchronize: configService.get<boolean>('DB_SYNCHRONIZE', false),
      logging: configService.get<boolean>('DB_LOGGING', false),
      entities: [User, Company, UserCompany, Transaction],
      migrations: [join(__dirname, 'migrations/*{.ts,.js}')],
      migrationsRun: configService.get<boolean>(
        'DB_MIGRATIONS_RUN',
        !isProduction,
      ),
      autoLoadEntities: false,
    };
  },
};
