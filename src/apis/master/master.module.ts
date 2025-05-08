import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { City } from '../tour/entities/city.entity';
import { TravelMode } from '../tour/entities/travel-mode.entity';
import { ItemType } from '../tour/entities/item-type.entity';
import { MasterDataController } from './master-data.controller';
import { MasterDataService } from './master-data.service';

@Module({
    imports: [TypeOrmModule.forFeature([City, TravelMode, ItemType])],
    controllers: [MasterDataController],
    providers: [MasterDataService],
    exports: [MasterDataService],
})
export class MasterModule {}
