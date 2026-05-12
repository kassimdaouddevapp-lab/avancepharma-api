import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1778539160373 implements MigrationInterface {
    name = 'InitSchema1778539160373'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('SUPER_ADMIN', 'PHARMACY_ADMIN', 'PHARMACY_AGENT', 'HR_MANAGER', 'EMPLOYEE')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "passwordHash" character varying(255) NOT NULL, "role" "public"."users_role_enum" NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "lastLoginAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`CREATE TABLE "employers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "sector" character varying(100), "contactEmail" character varying(255) NOT NULL, "phone" character varying(20), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_f2c1aea3e8d7aa3c5fba949c97d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "employee_caps" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "employee_id" uuid NOT NULL, "monthly_cap_amount" numeric(10,2) NOT NULL, "valid_from" date NOT NULL, "valid_to" date, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "employeeId" uuid, CONSTRAINT "PK_c6636eb7b5581c4f1f67e002fc0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "employees" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "employer_id" uuid NOT NULL, "user_id" uuid NOT NULL, "matricule" character varying(50) NOT NULL, "firstName" character varying(100) NOT NULL, "lastName" character varying(100) NOT NULL, "department" character varying(100), "qr_code_secret" character varying(255) NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "employerId" uuid, CONSTRAINT "PK_b9535a98350d5b26e7eb0c26af4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_2598d26f26af948c5be667f8e5" ON "employees" ("employer_id", "matricule") `);
        await queryRunner.query(`CREATE TABLE "pharmacy_agents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "pharmacy_id" uuid NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "pharmacyId" uuid, CONSTRAINT "PK_fe43df3c741349c557f19f8981e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_5b5979019b7a563f182fe888ef" ON "pharmacy_agents" ("user_id", "pharmacy_id") `);
        await queryRunner.query(`CREATE TABLE "pharmacies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "registration_number" character varying(50), "address" text NOT NULL, "phone" character varying(20), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_887410330080d3beb73850ebc8f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_d4017debf4e53f35cc5c415004" ON "pharmacies" ("registration_number") WHERE registration_number IS NOT NULL`);
        await queryRunner.query(`CREATE TYPE "public"."transactions_status_enum" AS ENUM('PENDING', 'VALIDATED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "employee_id" uuid NOT NULL, "pharmacy_id" uuid NOT NULL, "pharmacy_agent_id" uuid, "requested_amount" numeric(10,2) NOT NULL, "approved_amount" numeric(10,2), "status" "public"."transactions_status_enum" NOT NULL DEFAULT 'PENDING', "notes" text, "transaction_date" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."audit_logs_actor_role_enum" AS ENUM('SUPER_ADMIN', 'PHARMACY_ADMIN', 'PHARMACY_AGENT', 'HR_MANAGER', 'EMPLOYEE')`);
        await queryRunner.query(`CREATE TYPE "public"."audit_logs_action_enum" AS ENUM('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'VALIDATE')`);
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "actor_id" uuid, "actor_role" "public"."audit_logs_actor_role_enum", "action" "public"."audit_logs_action_enum" NOT NULL, "entity_name" character varying(255) NOT NULL, "entity_id" uuid, "previous_state" jsonb, "new_state" jsonb, "ip_address" character varying(50), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "employee_caps" ADD CONSTRAINT "FK_ae60407f210082dc0338fd3e071" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employees" ADD CONSTRAINT "FK_d8c7b6425560b798d7cfc0fedb8" FOREIGN KEY ("employerId") REFERENCES "employers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pharmacy_agents" ADD CONSTRAINT "FK_f60d675aa2c90e7e1bc0d140a4b" FOREIGN KEY ("pharmacyId") REFERENCES "pharmacies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_eeaf48e230619e81e05a327b5dc" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_c2eccdffbf410f4e06f46b8e7b1" FOREIGN KEY ("pharmacy_id") REFERENCES "pharmacies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_b4a22872a680ff1b7e8f06b15a1" FOREIGN KEY ("pharmacy_agent_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_b4a22872a680ff1b7e8f06b15a1"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_c2eccdffbf410f4e06f46b8e7b1"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_eeaf48e230619e81e05a327b5dc"`);
        await queryRunner.query(`ALTER TABLE "pharmacy_agents" DROP CONSTRAINT "FK_f60d675aa2c90e7e1bc0d140a4b"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP CONSTRAINT "FK_d8c7b6425560b798d7cfc0fedb8"`);
        await queryRunner.query(`ALTER TABLE "employee_caps" DROP CONSTRAINT "FK_ae60407f210082dc0338fd3e071"`);
        await queryRunner.query(`DROP TABLE "audit_logs"`);
        await queryRunner.query(`DROP TYPE "public"."audit_logs_action_enum"`);
        await queryRunner.query(`DROP TYPE "public"."audit_logs_actor_role_enum"`);
        await queryRunner.query(`DROP TABLE "transactions"`);
        await queryRunner.query(`DROP TYPE "public"."transactions_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d4017debf4e53f35cc5c415004"`);
        await queryRunner.query(`DROP TABLE "pharmacies"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5b5979019b7a563f182fe888ef"`);
        await queryRunner.query(`DROP TABLE "pharmacy_agents"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2598d26f26af948c5be667f8e5"`);
        await queryRunner.query(`DROP TABLE "employees"`);
        await queryRunner.query(`DROP TABLE "employee_caps"`);
        await queryRunner.query(`DROP TABLE "employers"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
