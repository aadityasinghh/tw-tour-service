import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('item_types')
export class ItemType {
    @PrimaryGeneratedColumn('uuid')
    itemTypeId: string;

    @Column({ name: 'name', type: 'varchar' })
    name: string;

    @Column({ name: 'code', type: 'varchar' })
    code: string;

    @Column({ name: 'description', type: 'text', nullable: true })
    description: string;
}
