import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('travel_modes')
export class TravelMode {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'mode', type: 'varchar' })
    mode: string;

    @Column({ name: 'code', type: 'varchar', unique: true })
    code: string;

    @Column({ name: 'validation_field', type: 'varchar' })
    validationField: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
