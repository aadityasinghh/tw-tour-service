import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/core/db/db.module';
import { TourModule } from './tour/tour.module';

@Module({
  imports: [DatabaseModule, TourModule],
  providers: [],
})
export class ApiModule {}
