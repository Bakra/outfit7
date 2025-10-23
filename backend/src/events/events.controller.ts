import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  BadRequestException,
  Req,
  HttpCode,
  HttpStatus,
  Logger 
} from '@nestjs/common';
import type { Request } from 'express';
import { EventsService } from './events.service';
import { GeoipService } from '../geoip/geoip.service';
import { CreateEventDto, EventType } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import type { Event } from './interfaces/event.interface';

@Controller('events')
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(
    private readonly eventsService: EventsService,
    private readonly geoipService: GeoipService,
  ) {}

  @Get()
  findAll(): Event[] {
    return this.eventsService.findAll();
  }

  @Get('ads-permission')
  async checkAdsPermission(@Req() request: Request): Promise<{ canCreateAds: boolean }> {
    // Extract client IP from request
    const clientIP = this.getClientIP(request);
    const canCreateAds = await this.geoipService.getAdsPermissionForIP(clientIP);
    
    return { canCreateAds };
  }

  @Get(':id')
  findOne(@Param('id') id: string): Event {
    return this.eventsService.findOne(id);
  }

  @Post()
  async create(@Body() createEventDto: CreateEventDto, @Req() request: Request): Promise<Event> {
    this.logger.log(`Creating event: ${JSON.stringify(createEventDto)}`);
    
    // If trying to create ads type event, check permission
    if (createEventDto.type === EventType.ADS) {
      const clientIP = this.getClientIP(request);
      this.logger.log(`Checking ads permission for IP: ${clientIP}`);
      const canCreateAds = await this.geoipService.getAdsPermissionForIP(clientIP);
      
      if (!canCreateAds) {
        this.logger.warn(`Ads permission denied for IP: ${clientIP}`);
        throw new BadRequestException('You do not have permission to create ads type events');
      }
    }

    try {
      const newEvent = this.eventsService.create(createEventDto);
      this.logger.log(`Event created successfully: ${newEvent.id}`);
      return newEvent;
    } catch (error) {
      this.logger.error(`Failed to create event: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string, 
    @Body() updateEventDto: UpdateEventDto,
    @Req() request: Request
  ): Promise<Event> {
    // If trying to update to ads type, check permission
    if (updateEventDto.type === EventType.ADS) {
      const clientIP = this.getClientIP(request);
      const canCreateAds = await this.geoipService.getAdsPermissionForIP(clientIP);
      
      if (!canCreateAds) {
        throw new BadRequestException('You do not have permission to set event type to ads');
      }
    }

    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): void {
    this.eventsService.remove(id);
  }

  /**
   * Extract client IP address from request
   */
  private getClientIP(request: Request): string | undefined {
    return (
      (request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (request.headers['x-real-ip'] as string) ||
      request.socket?.remoteAddress ||
      undefined
    );
  }
}