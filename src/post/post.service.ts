import { HttpService, Injectable } from '@nestjs/common';
import { map } from 'rxjs/operators';

@Injectable()
export class PostService {
  constructor(private httpService: HttpService) {}

  getRandomPost() {
    const clientId = process.env.UNSPLASH_CLIENT_ID;
    const keyword = 'woman';
    const requestString = `https://api.unsplash.com/search/photos/?client_id=${clientId}&query=${keyword}`;

    return this.httpService
      .get(requestString)
      .pipe(map((response) => response.data));
  }
}
