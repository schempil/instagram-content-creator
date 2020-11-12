import { HttpService, Injectable } from '@nestjs/common';
import { map } from 'rxjs/operators';

@Injectable()
export class PostService {
  constructor(private httpService: HttpService) {}

  getRandomPost() {
    return this.httpService
      .get('https://jsonplaceholder.typicode.com/todos/1')
      .pipe(map((response) => response.data));
  }
}
