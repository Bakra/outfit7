import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from './interfaces/event.interface';

@Injectable()
export class EventsService {
  private events: Event[] = [];

  /**
   * Get all events
   */
  findAll(): Event[] {
    return this.events;
  }

  /**
   * Get event by ID
   */
  findOne(id: string): Event {
    const event = this.events.find(event => event.id === id);
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  /**
   * Create a new event
   */
  create(createEventDto: CreateEventDto): Event {
    // Check if name already exists
    const existingEvent = this.events.find(event => event.name === createEventDto.name);
    if (existingEvent) {
      throw new ConflictException(`Event with name '${createEventDto.name}' already exists`);
    }

    const newEvent: Event = {
      id: randomUUID(),
      ...createEventDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.events.push(newEvent);
    return newEvent;
  }

  /**
   * Update an existing event
   */
  update(id: string, updateEventDto: UpdateEventDto): Event {
    const eventIndex = this.events.findIndex(event => event.id === id);
    if (eventIndex === -1) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    // Check if new name conflicts with existing events (excluding current one)
    if (updateEventDto.name) {
      const conflictingEvent = this.events.find(
        event => event.name === updateEventDto.name && event.id !== id
      );
      if (conflictingEvent) {
        throw new ConflictException(`Event with name '${updateEventDto.name}' already exists`);
      }
    }

    const updatedEvent: Event = {
      ...this.events[eventIndex],
      ...updateEventDto,
      updatedAt: new Date(),
    };

    this.events[eventIndex] = updatedEvent;
    return updatedEvent;
  }

  /**
   * Delete an event
   */
  remove(id: string): void {
    const eventIndex = this.events.findIndex(event => event.id === id);
    if (eventIndex === -1) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    this.events.splice(eventIndex, 1);
  }

  /**
   * Check if event name already exists
   */
  isNameTaken(name: string, excludeId?: string): boolean {
    return this.events.some(event => 
      event.name === name && (!excludeId || event.id !== excludeId)
    );
  }
}