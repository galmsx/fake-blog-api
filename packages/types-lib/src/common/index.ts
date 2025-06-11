import { IsNumber, IsPositive, IsEnum, IsOptional, Min } from 'class-validator';

export type UUID = string;

export interface Page<T> {
  page: PageOptions;
  total: number;
  data: T[];
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}
export class PageOptions {
  @IsNumber()
  @IsPositive()
  limit: number;
  @IsNumber()
  @Min(0)
  offset: number;
  @IsEnum(SortOrder)
  @IsOptional()
  sort?: SortOrder;
}
export class HealthCheckData{
  dbConnection?: string;
}
