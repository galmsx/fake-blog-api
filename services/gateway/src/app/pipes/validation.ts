import {
    ArgumentMetadata,
    BadRequestException,
    PipeTransform,
    Type,
  } from '@nestjs/common';
  import { plainToClass } from 'class-transformer';
  import { validate } from 'class-validator';
  
  export class ValidationPipe<T = any> implements PipeTransform {
    async transform(value: T, metadata: ArgumentMetadata): Promise<T | never> {
      const { metatype } = metadata;
  
      if (!metatype || !this.toValidate(metatype)) {
        return value;
      }
  
      const object = plainToClass(metatype, value);
      const errors = await validate(object);
  
      if (errors.length > 0) {
        throw new BadRequestException(errors);
      }
  
      return value;
    }
  
    private toValidate(metatype: Type<any>): boolean {
      const types = [String, Boolean, Number, Array, Object];
  
      return !types.find(type => metatype === type);
    }
  }