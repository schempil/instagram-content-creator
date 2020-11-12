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

		const filePath = await this.downloadPhoto(photo.id, keyword, photo.links.download)
		
		this.manipulatePhoto(filePath)

		return photo
  }

  manipulatePhoto(filePath: string) {
  	console.log('### manipul... uhm make it beautiful!', filePath)
	}

  async downloadPhoto(id: string, keyword: string, download: string): Promise<string> {

		const fs = require('fs')

		const directory = `./generations/${keyword}`

		if (!fs.existsSync(directory)){
			fs.mkdirSync(directory);
		}

		const filePath = `${directory}/${id}.png`

		const writer = fs.createWriteStream(filePath)

		const response = await this.httpService.axiosRef({
			url: download,
			method: 'GET',
			responseType: 'stream',
		})

		response.data.pipe(writer)

		return new Promise((resolve, reject) => {
			writer.on('finish', resolve(filePath))
			writer.on('error', reject)
		})
	}
}
