import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('tour_stops')
export class TourStop {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tour_id', type: 'uuid' })
    tourId: string;

    @Column({ name: 'city_id', type: 'uuid' })
    cityId: string;

    @Column({ name: 'stop_sequence', type: 'integer' })
    stopSequence: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
