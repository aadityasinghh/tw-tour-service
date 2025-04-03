import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tours')
export class Tour {
  @PrimaryGeneratedColumn('uuid')
  tourId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'source_city_id', type: 'uuid' })
  sourceCityId: string;

  @Column({ name: 'destination_city_id', type: 'uuid' })
  destinationCityId: string;

  @Column({ name: 'travel_mode_id', type: 'uuid' })
  travelModeId: string;

  @Column({ name: 'departure_time', type: 'timestamp' })
  departureTime: Date;

  @Column({ name: 'arrival_time', type: 'timestamp' })
  arrivalTime: Date;

  @Column({ name: 'item_type_id', type: 'uuid' })
  itemTypeId: string;

  @Column({ name: 'max_weight', type: 'float' })
  maxWeight: number;

  @Column({ name: 'available_space', type: 'integer' })
  availableSpace: number;

  @Column({ name: 'pickup_address_id', type: 'uuid' })
  pickupAddressId: string;

  @Column({ name: 'drop_address_id', type: 'uuid' })
  dropAddressId: string;

  @Column({ name: 'max_items', type: 'integer' })
  maxItems: number;

  @Column({ name: 'price_per_kg', type: 'decimal', precision: 10, scale: 2 })
  pricePerKg: number;

  @Column({ name: 'pnr_number', type: 'varchar' })
  pnrNumber: string;

  @Column({ name: 'pnr_verified', type: 'boolean', default: false })
  pnrVerified: boolean;

  @Column({ name: 'journey_date', type: 'date' })
  journeyDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
