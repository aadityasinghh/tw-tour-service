import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1746098484107 implements MigrationInterface {
    name = 'Migration1746098484107'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."tours_status_enum" RENAME TO "tours_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."tours_status_enum" AS ENUM('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED')`);
        await queryRunner.query(`ALTER TABLE "tours" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "tours" ALTER COLUMN "status" TYPE "public"."tours_status_enum" USING "status"::"text"::"public"."tours_status_enum"`);
        await queryRunner.query(`ALTER TABLE "tours" ALTER COLUMN "status" SET DEFAULT 'PENDING'`);
        await queryRunner.query(`DROP TYPE "public"."tours_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."tours_status_enum_old" AS ENUM('active', 'completed', 'cancelled')`);
        await queryRunner.query(`ALTER TABLE "tours" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "tours" ALTER COLUMN "status" TYPE "public"."tours_status_enum_old" USING "status"::"text"::"public"."tours_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "tours" ALTER COLUMN "status" SET DEFAULT 'active'`);
        await queryRunner.query(`DROP TYPE "public"."tours_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."tours_status_enum_old" RENAME TO "tours_status_enum"`);
    }

}
