import { Injectable } from '@nestjs/common';

@Injectable()
export class PostService {
  getRandomPost() {
    return 'RANDOM BITCH!';
  }
}
