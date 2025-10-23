import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { GeoipService } from '../geoip/geoip.service';

@Module({
  controllers: [EventsController],
  providers: [EventsService, GeoipService],
  exports: [EventsService],
})
export class EventsModule {}