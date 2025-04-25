import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { TourService } from './tour.service';
import { Tour } from './entities/tour.entity';
import { TourStop } from './entities/tour-stop.entity';
import { City } from './entities/city.entity';
import { TravelMode } from './entities/travel-mode.entity';
import { ItemType } from './entities/item-type.entity';
import { Address } from './entities/address.entity';
import { ToursService } from './tour.service';
import { ToursController } from './tour.controller';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { NotificationService } from '../notification/notification.service';

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
    HttpModule,
  ],
  controllers: [ToursController],
  providers: [ToursService, ConfigService, NotificationService],
  exports: [ToursService],
})
export class TourModule {}
