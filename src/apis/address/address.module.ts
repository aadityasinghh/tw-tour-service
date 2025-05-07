import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { TourService } from './tour.service';
import { HttpModule, } from '@nestjs/axios';
import { AddressController } from '../address/address.controller';
import { AddressService } from '../address/address.service';
import { Address } from '../tour/entities/address.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([Address]), HttpModule,ConfigModule],
  controllers: [AddressController],
  providers: [AddressService],
  exports: [AddressService],
})
export class AddressModule {}
