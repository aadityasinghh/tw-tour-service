import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/core/db/db.module';
import { TourModule } from './tour/tour.module';
import { AddressModule } from './address/address.module';
import { MasterModule } from './master/master.module';

@Module({
    imports: [DatabaseModule, TourModule, AddressModule, MasterModule],
    providers: [],
})
export class ApiModule {}
