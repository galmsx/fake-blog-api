import {
    IsUUID,
    IsOptional
  } from 'class-validator';
  import {UUID} from '../../common'

export class GetCommentsRequestDTO{
    @IsUUID()
    @IsOptional()
    readonly itemId?: UUID;
    authorId?: UUID;
    itemIds?: UUID[];
    authorIds?: UUID[];
}