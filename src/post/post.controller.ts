import {Controller, Get, Header, Param, Res} from '@nestjs/common';
import {PostService} from './post.service';
import {createReadStream} from "fs";
import {Response} from "express";

@Controller()
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('post/:keyword')
	@Header('Content-Type', 'image/png')
  async getPost(@Param() params, @Res() res: Response) {
    const filePath = await this.postService.getPostForKeyword(params.keyword)

		const stream =createReadStream(filePath)

		res.set({
			'Content-Type': 'image/png'
		});

		stream.pipe(res);
  }
}
