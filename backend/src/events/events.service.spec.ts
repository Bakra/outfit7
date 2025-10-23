import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto, EventType } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

describe('EventsService', () => {
  let service: EventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventsService],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new event', () => {
      const createEventDto: CreateEventDto = {
        name: 'test-event',
        description: 'Test event description',
        type: EventType.APP,
        priority: 5,
      };

      const result = service.create(createEventDto);

      expect(result).toMatchObject({
        name: createEventDto.name,
        description: createEventDto.description,
        type: createEventDto.type,
        priority: createEventDto.priority,
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('should throw ConflictException when name already exists', () => {
      const createEventDto: CreateEventDto = {
        name: 'duplicate-event',
        description: 'Test event description',
        type: EventType.APP,
        priority: 5,
      };

      service.create(createEventDto);

      expect(() => service.create(createEventDto)).toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return an empty array initially', () => {
      expect(service.findAll()).toEqual([]);
    });

    it('should return all events', () => {
      const createEventDto1: CreateEventDto = {
        name: 'event-1',
        description: 'Event 1',
        type: EventType.APP,
        priority: 1,
      };

      const createEventDto2: CreateEventDto = {
        name: 'event-2',
        description: 'Event 2',
        type: EventType.LIVEOPS,
        priority: 2,
      };

      const event1 = service.create(createEventDto1);
      const event2 = service.create(createEventDto2);

      const events = service.findAll();
      expect(events).toHaveLength(2);
      expect(events).toContain(event1);
      expect(events).toContain(event2);
    });
  });

  describe('findOne', () => {
    it('should return an event by id', () => {
      const createEventDto: CreateEventDto = {
        name: 'test-event',
        description: 'Test event description',
        type: EventType.APP,
        priority: 5,
      };

      const createdEvent = service.create(createEventDto);
      const foundEvent = service.findOne(createdEvent.id);

      expect(foundEvent).toEqual(createdEvent);
    });

    it('should throw NotFoundException when event not found', () => {
      expect(() => service.findOne('non-existent-id')).toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an existing event', async () => {
      const createEventDto: CreateEventDto = {
        name: 'original-event',
        description: 'Original description',
        type: EventType.APP,
        priority: 5,
      };

      const createdEvent = service.create(createEventDto);
      
      // Add a small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const updateEventDto: UpdateEventDto = {
        name: 'updated-event',
        description: 'Updated description',
        priority: 7,
      };

      const updatedEvent = service.update(createdEvent.id, updateEventDto);

      expect(updatedEvent.name).toBe(updateEventDto.name);
      expect(updatedEvent.description).toBe(updateEventDto.description);
      expect(updatedEvent.priority).toBe(updateEventDto.priority);
      expect(updatedEvent.type).toBe(createEventDto.type); // unchanged
      expect(updatedEvent.updatedAt.getTime()).toBeGreaterThan(createdEvent.updatedAt.getTime());
    });

    it('should throw NotFoundException when updating non-existent event', () => {
      const updateEventDto: UpdateEventDto = {
        name: 'updated-event',
      };

      expect(() => service.update('non-existent-id', updateEventDto)).toThrow(NotFoundException);
    });

    it('should throw ConflictException when updating to existing name', () => {
      const createEventDto1: CreateEventDto = {
        name: 'event-1',
        description: 'Event 1',
        type: EventType.APP,
        priority: 1,
      };

      const createEventDto2: CreateEventDto = {
        name: 'event-2',
        description: 'Event 2',
        type: EventType.APP,
        priority: 2,
      };

      const event1 = service.create(createEventDto1);
      service.create(createEventDto2);

      const updateEventDto: UpdateEventDto = {
        name: 'event-2', // trying to use existing name
      };

      expect(() => service.update(event1.id, updateEventDto)).toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove an event', () => {
      const createEventDto: CreateEventDto = {
        name: 'test-event',
        description: 'Test event description',
        type: EventType.APP,
        priority: 5,
      };

      const createdEvent = service.create(createEventDto);
      expect(service.findAll()).toHaveLength(1);

      service.remove(createdEvent.id);
      expect(service.findAll()).toHaveLength(0);
    });

    it('should throw NotFoundException when removing non-existent event', () => {
      expect(() => service.remove('non-existent-id')).toThrow(NotFoundException);
    });
  });

  describe('isNameTaken', () => {
    it('should return true when name is taken', () => {
      const createEventDto: CreateEventDto = {
        name: 'taken-name',
        description: 'Test event description',
        type: EventType.APP,
        priority: 5,
      };

      service.create(createEventDto);
      expect(service.isNameTaken('taken-name')).toBe(true);
    });

    it('should return false when name is not taken', () => {
      expect(service.isNameTaken('available-name')).toBe(false);
    });

    it('should exclude specified id when checking name', () => {
      const createEventDto: CreateEventDto = {
        name: 'test-name',
        description: 'Test event description',
        type: EventType.APP,
        priority: 5,
      };

      const event = service.create(createEventDto);
      expect(service.isNameTaken('test-name', event.id)).toBe(false);
    });
  });
});