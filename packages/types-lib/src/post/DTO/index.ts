import {
    IsUUID,
  } from 'class-validator';
import { PageOptions, UUID } from '../../common';


  export class GetPostsRequestDTO extends PageOptions{
    @IsUUID()
    authorId: UUID;
  }