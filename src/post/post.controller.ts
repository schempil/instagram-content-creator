import { Controller, Get } from '@nestjs/common';
import { PostService } from './post.service';
import { Observable } from 'rxjs';

@Controller()
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('random')
  getRandomPost(): Observable<any> {
    return this.postService.getRandomPost();
  }
}
