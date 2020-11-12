import { HttpService, Injectable } from '@nestjs/common';

@Injectable()
export class PostService {
  constructor(private httpService: HttpService) {}

  getRandomPost() {
    return this.httpService.get('https://jsonplaceholder.typicode.com/todos/1');
  }
}
