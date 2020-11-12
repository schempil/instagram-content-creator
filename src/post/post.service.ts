import { HttpService, Injectable } from '@nestjs/common';
import { map } from 'rxjs/operators';

@Injectable()
export class PostService {
  constructor(private httpService: HttpService) {}

  async getRandomPost() {
    const clientId = process.env.UNSPLASH_CLIENT_ID;
    const keyword = 'woman';
    const requestString = `https://api.unsplash.com/photos/random?client_id=${clientId}&query=${keyword}`

	const photo = await this.httpService
	  .get(requestString)
	  .pipe(map((response) => response.data))
	  .toPromise()

    return photo
  }

  async donwloadPhoto(download: string) {

		const fs = require('fs')

		const writer = fs.createWriteStream('./generations/image.png')

		const response = await this.httpService.axiosRef({
			url: download,
			method: 'GET',
			responseType: 'stream',
		})

		response.data.pipe(writer)

		return new Promise((resolve, reject) => {
			writer.on('finish', resolve)
			writer.on('error', reject)
		})

	}
}
