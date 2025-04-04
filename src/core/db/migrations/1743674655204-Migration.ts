import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1743674655204 implements MigrationInterface {
    name = 'Migration1743674655204'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "travel_modes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "mode" character varying NOT NULL, "code" character varying NOT NULL, "validation_field" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e3ab9aa39124a19215a2e570226" UNIQUE ("code"), CONSTRAINT "PK_d3ea9706089c8f77b114c024199" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tours" ("tourId" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "source_city_id" uuid NOT NULL, "destination_city_id" uuid NOT NULL, "travel_mode_id" uuid NOT NULL, "departure_time" TIMESTAMP NOT NULL, "arrival_time" TIMESTAMP NOT NULL, "item_type_id" uuid NOT NULL, "max_weight" double precision NOT NULL, "available_space" integer NOT NULL, "pickup_address_id" uuid NOT NULL, "drop_address_id" uuid NOT NULL, "max_items" integer NOT NULL, "price_per_kg" numeric(10,2) NOT NULL, "pnr_number" character varying NOT NULL, "pnr_verified" boolean NOT NULL DEFAULT false, "journey_date" date NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_081c970681edaefa1e9818d80b7" PRIMARY KEY ("tourId"))`);
        await queryRunner.query(`CREATE TABLE "tour_stops" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tour_id" uuid NOT NULL, "city_id" uuid NOT NULL, "stop_sequence" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_859240aea6631d62908962789a0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "item_types" ("itemTypeId" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "code" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_53072c1f6c4f6bf8aa075377149" PRIMARY KEY ("itemTypeId"))`);
        await queryRunner.query(`CREATE TABLE "cities" ("cityId" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "coordinate" character varying NOT NULL, "state" character varying NOT NULL, "code" character varying NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_23ef12c9f387e2cbac07e7d2927" UNIQUE ("code"), CONSTRAINT "PK_38fa90350025d17a78886e4a4bd" PRIMARY KEY ("cityId"))`);
        await queryRunner.query(`CREATE TABLE "addresses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "tour_id" uuid, "line_1" character varying NOT NULL, "line_2" character varying, "city_id" uuid NOT NULL, "state" character varying NOT NULL, "pincode" character varying NOT NULL, "latitude" double precision, "longitude" double precision, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_745d8f43d3af10ab8247465e450" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "addresses"`);
        await queryRunner.query(`DROP TABLE "cities"`);
        await queryRunner.query(`DROP TABLE "item_types"`);
        await queryRunner.query(`DROP TABLE "tour_stops"`);
        await queryRunner.query(`DROP TABLE "tours"`);
        await queryRunner.query(`DROP TABLE "travel_modes"`);
    }

}
