import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TourController } from './tour.controller';
import { TourService } from './tour.service';
import { Tour } from './entities/tour.entity';
import { TourStop } from './entities/tour-stop.entity';
import { City } from './entities/city.entity';
import { TravelMode } from './entities/travel-mode.entity';
import { ItemType } from './entities/item-type.entity';
import { Address } from './entities/address.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tour,
      TourStop,
      City,
      TravelMode,
      ItemType,
      Address,
    ]),
  ],
  controllers: [TourController],
  providers: [TourService],
  exports: [TourService],
})
export class TourModule {}
