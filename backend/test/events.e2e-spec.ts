import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { EventsModule } from '../src/events/events.module';
import { EventType } from '../src/events/dto/create-event.dto';

describe('Events (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [EventsModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/events (GET)', () => {
    it('should return empty array initially', () => {
      return request(app.getHttpServer())
        .get('/events')
        .expect(200)
        .expect([]);
    });
  });

  describe('/events (POST)', () => {
    it('should create a new event', () => {
      const createEventDto = {
        name: 'test-event',
        description: 'Test description',
        type: EventType.APP,
        priority: 5,
      };

      return request(app.getHttpServer())
        .post('/events')
        .send(createEventDto)
        .expect(201)
        .expect((res: any) => {
          expect(res.body).toMatchObject(createEventDto);
          expect(res.body.id).toBeDefined();
          expect(res.body.createdAt).toBeDefined();
          expect(res.body.updatedAt).toBeDefined();
        });
    });

    it('should validate required fields', () => {
      const invalidDto = {
        name: '',
        // missing description, type, priority
      };

      return request(app.getHttpServer())
        .post('/events')
        .send(invalidDto)
        .expect(400);
    });

    it('should validate priority range', () => {
      const invalidDto = {
        name: 'test-event',
        description: 'Test description',
        type: EventType.APP,
        priority: 15, // invalid, should be 0-10
      };

      return request(app.getHttpServer())
        .post('/events')
        .send(invalidDto)
        .expect(400);
    });

    it('should validate event type enum', () => {
      const invalidDto = {
        name: 'test-event',
        description: 'Test description',
        type: 'invalid-type',
        priority: 5,
      };

      return request(app.getHttpServer())
        .post('/events')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('/events/:id (GET)', () => {
    it('should get event by id', async () => {
      const createEventDto = {
        name: 'test-event',
        description: 'Test description',
        type: EventType.APP,
        priority: 5,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/events')
        .send(createEventDto)
        .expect(201);

      const eventId = createResponse.body.id;

      return request(app.getHttpServer())
        .get(`/events/${eventId}`)
        .expect(200)
        .expect((res: any) => {
          expect(res.body).toMatchObject(createEventDto);
          expect(res.body.id).toBe(eventId);
        });
    });

    it('should return 404 for non-existent event', () => {
      return request(app.getHttpServer())
        .get('/events/non-existent-id')
        .expect(404);
    });
  });

  describe('/events/:id (PUT)', () => {
    it('should update an event', async () => {
      const createEventDto = {
        name: 'original-event',
        description: 'Original description',
        type: EventType.APP,
        priority: 5,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/events')
        .send(createEventDto)
        .expect(201);

      const eventId = createResponse.body.id;
      const updateDto = {
        name: 'updated-event',
        description: 'Updated description',
        priority: 8,
      };

      return request(app.getHttpServer())
        .put(`/events/${eventId}`)
        .send(updateDto)
        .expect(200)
        .expect((res: any) => {
          expect(res.body.name).toBe(updateDto.name);
          expect(res.body.description).toBe(updateDto.description);
          expect(res.body.priority).toBe(updateDto.priority);
          expect(res.body.type).toBe(createEventDto.type); // unchanged
        });
    });

    it('should return 404 when updating non-existent event', () => {
      const updateDto = {
        name: 'updated-event',
      };

      return request(app.getHttpServer())
        .put('/events/non-existent-id')
        .send(updateDto)
        .expect(404);
    });
  });

  describe('/events/:id (DELETE)', () => {
    it('should delete an event', async () => {
      const createEventDto = {
        name: 'event-to-delete',
        description: 'This will be deleted',
        type: EventType.APP,
        priority: 5,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/events')
        .send(createEventDto)
        .expect(201);

      const eventId = createResponse.body.id;

      // Delete the event
      await request(app.getHttpServer())
        .delete(`/events/${eventId}`)
        .expect(204);

      // Verify it's gone
      return request(app.getHttpServer())
        .get(`/events/${eventId}`)
        .expect(404);
    });

    it('should return 404 when deleting non-existent event', () => {
      return request(app.getHttpServer())
        .delete('/events/non-existent-id')
        .expect(404);
    });
  });

  describe('/events/ads-permission (GET)', () => {
    it('should return ads permission status', () => {
      return request(app.getHttpServer())
        .get('/events/ads-permission')
        .expect(200)
        .expect((res: any) => {
          expect(res.body).toHaveProperty('canCreateAds');
          expect(typeof res.body.canCreateAds).toBe('boolean');
        });
    });
  });
});