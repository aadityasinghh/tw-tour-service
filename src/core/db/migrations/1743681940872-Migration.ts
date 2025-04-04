import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1743681940872 implements MigrationInterface {
    name = 'Migration1743681940872'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "addresses" RENAME COLUMN "userId" TO "user_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "addresses" RENAME COLUMN "user_id" TO "userId"`);
    }

}
