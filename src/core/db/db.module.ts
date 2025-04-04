import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from 'src/apis/tour/entities/address.entity';
import { City } from 'src/apis/tour/entities/city.entity';
import { ItemType } from 'src/apis/tour/entities/item-type.entity';
import { TourStop } from 'src/apis/tour/entities/tour-stop.entity';
import { Tour } from 'src/apis/tour/entities/tour.entity';
import { TravelMode } from 'src/apis/tour/entities/travel-mode.entity';
// import { User } from 'src/apis/user/entities/user.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'adityasingh393',
      password: 'Aditya@20',
      database: 'tw-tours',
      // entities: [__dirname + '/**/*.entity{.ts/,.js}'],
      entities: [Tour, Address, TourStop, City, TravelMode, ItemType],
      migrations: [__dirname + '/migrations/*.ts'],
      migrationsRun: true,
      synchronize: false,
    }),
  ],
})
export class DatabaseModule {}
