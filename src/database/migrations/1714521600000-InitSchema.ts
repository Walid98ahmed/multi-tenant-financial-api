import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1714521600000 implements MigrationInterface {
  name = 'InitSchema1714521600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(
      `CREATE TYPE company_role_enum AS ENUM ('OWNER', 'MEMBER')`,
    );
    await queryRunner.query(
      `CREATE TYPE transaction_type_enum AS ENUM ('REVENUE', 'EXPENSE')`,
    );

    await queryRunner.query(`
      CREATE TABLE users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email varchar(255) NOT NULL UNIQUE,
        password_hash varchar(255) NOT NULL,
        name varchar(150) NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE companies (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar(200) NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE user_companies (
        user_id uuid NOT NULL,
        company_id uuid NOT NULL,
        role company_role_enum NOT NULL DEFAULT 'MEMBER',
        created_at timestamptz NOT NULL DEFAULT now(),
        PRIMARY KEY (user_id, company_id),
        CONSTRAINT fk_user_companies_user
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_user_companies_company
          FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE transactions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id uuid NOT NULL,
        amount numeric(14,2) NOT NULL,
        type transaction_type_enum NOT NULL,
        description varchar(500),
        created_by_user_id uuid,
        created_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT fk_transactions_company
          FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE RESTRICT,
        CONSTRAINT fk_transactions_user
          FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    await queryRunner.query(
      `CREATE UNIQUE INDEX idx_users_email ON users (email)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_companies_name ON companies (name)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_user_companies_user_id ON user_companies (user_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_user_companies_company_id ON user_companies (company_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_transactions_company_id ON transactions (company_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_transactions_company_created_at ON transactions (company_id, created_at DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_transactions_company_type ON transactions (company_id, type)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_transactions_company_type`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_transactions_company_created_at`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS idx_transactions_company_id`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_user_companies_company_id`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS idx_user_companies_user_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_companies_name`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_email`);

    await queryRunner.query(`DROP TABLE IF EXISTS transactions`);
    await queryRunner.query(`DROP TABLE IF EXISTS user_companies`);
    await queryRunner.query(`DROP TABLE IF EXISTS companies`);
    await queryRunner.query(`DROP TABLE IF EXISTS users`);

    await queryRunner.query(`DROP TYPE IF EXISTS transaction_type_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS company_role_enum`);
  }
}
