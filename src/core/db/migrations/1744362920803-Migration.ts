import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1744362920803 implements MigrationInterface {
    name = 'Migration1744362920803'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tour_item_types" ("tour_id" uuid NOT NULL, "item_type_id" uuid NOT NULL, CONSTRAINT "PK_21a52aae41ede8509de2e8ae180" PRIMARY KEY ("tour_id", "item_type_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1f88e4ac4027f4a9c47f049051" ON "tour_item_types" ("tour_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_bb4051c0292b204e3178926bf4" ON "tour_item_types" ("item_type_id") `);
        await queryRunner.query(`ALTER TABLE "item_types" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "item_types" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "item_types" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "tours" DROP COLUMN "item_type_id"`);
        await queryRunner.query(`ALTER TABLE "item_types" ADD "description" text`);
        await queryRunner.query(`ALTER TABLE "tour_item_types" ADD CONSTRAINT "FK_1f88e4ac4027f4a9c47f0490514" FOREIGN KEY ("tour_id") REFERENCES "tours"("tourId") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "tour_item_types" ADD CONSTRAINT "FK_bb4051c0292b204e3178926bf48" FOREIGN KEY ("item_type_id") REFERENCES "item_types"("itemTypeId") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tour_item_types" DROP CONSTRAINT "FK_bb4051c0292b204e3178926bf48"`);
        await queryRunner.query(`ALTER TABLE "tour_item_types" DROP CONSTRAINT "FK_1f88e4ac4027f4a9c47f0490514"`);
        await queryRunner.query(`ALTER TABLE "item_types" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "tours" ADD "item_type_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "item_types" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "item_types" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "item_types" ADD "is_active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bb4051c0292b204e3178926bf4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1f88e4ac4027f4a9c47f049051"`);
        await queryRunner.query(`DROP TABLE "tour_item_types"`);
    }

}
