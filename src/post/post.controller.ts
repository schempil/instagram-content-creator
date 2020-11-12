import {Controller, Get, Param} from '@nestjs/common';
import {PostService} from './post.service';

@Controller()
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('post/:keyword')
  getPost(@Param() params): any {
    return this.postService.getPostForKeyword(params.keyword)
  }
}
