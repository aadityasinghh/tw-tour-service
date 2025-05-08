import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { City } from './city.entity';

@Entity('addresses')
export class Address {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @Column({ name: 'tour_id', type: 'uuid', nullable: true })
    tourId: string;

    @Column({ name: 'line_1', type: 'varchar' })
    line1: string;

    @Column({ name: 'line_2', type: 'varchar', nullable: true })
    line2: string;

    @Column({ name: 'city_id', type: 'uuid' })
    cityId: string;

    @ManyToOne(() => City)
    @JoinColumn({ name: 'city_id' })
    city: City;

    @Column({ name: 'state', type: 'varchar' })
    state: string;

    @Column({ name: 'pincode', type: 'varchar' })
    pincode: string;

    @Column({ name: 'latitude', type: 'float', nullable: true })
    latitude: number;

    @Column({ name: 'longitude', type: 'float', nullable: true })
    longitude: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
