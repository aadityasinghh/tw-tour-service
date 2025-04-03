import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/core/db/db.module';

@Module({
  imports: [DatabaseModule],
  providers: [],
})
export class ApiModule {}
