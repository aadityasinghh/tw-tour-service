import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('cities')
export class City {
  @PrimaryGeneratedColumn('uuid')
  cityId: string;

  @Column({ name: 'name', type: 'varchar' })
  name: string;

  @Column({ name: 'coordinate', type: 'varchar' })
  coordinate: string;

  @Column({ name: 'state', type: 'varchar' })
  state: string;

  @Column({ name: 'code', type: 'varchar', unique: true })
  code: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
