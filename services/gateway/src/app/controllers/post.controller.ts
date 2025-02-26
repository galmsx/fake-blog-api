import {
  Controller,
  Inject,
  Get,
  Body,
} from '@nestjs/common';
import { POST_SERVICE } from '../constants';
import { PostRPC } from '@local/grpc-lib';
import { Post } from '@local/types-lib';

@Controller('/post')
export class PostController {
  constructor(
    @Inject(POST_SERVICE) private readonly postService: PostRPC.PostService
  ) {}

  @Get()
  getAllPosts(@Body() body: Post.DTO.GetPostsRequestDTO) {
    return this.postService.getAllPosts(body);
  }
}
