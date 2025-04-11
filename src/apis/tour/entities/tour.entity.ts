import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ItemType } from '../entities/item-type.entity';

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

  // Remove the single itemTypeId field and replace with many-to-many relationship
  @ManyToMany(() => ItemType)
  @JoinTable({
    name: 'tour_item_types',
    joinColumn: { name: 'tour_id', referencedColumnName: 'tourId' },
    inverseJoinColumn: {
      name: 'item_type_id',
      referencedColumnName: 'itemTypeId',
    },
  })
  itemTypes: ItemType[];

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
