import { IsString, IsNotEmpty, IsEnum, IsInt, Min, Max, Length } from 'class-validator';

export enum EventType {
  CROSSPROMO = 'crosspromo',
  LIVEOPS = 'liveops',
  APP = 'app',
  ADS = 'ads'
}

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 500)
  description: string;

  @IsEnum(EventType)
  type: EventType;

  @IsInt()
  @Min(0)
  @Max(10)
  priority: number;
}