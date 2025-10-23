import { EventType } from '../dto/create-event.dto';

export interface Event {
  id: string;
  name: string;
  description: string;
  type: EventType;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}