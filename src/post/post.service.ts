import { HttpService, Injectable } from '@nestjs/common';
import { map } from 'rxjs/operators';

@Injectable()
export class PostService {
  constructor(private httpService: HttpService) {}

  async getPostForKeyword(keyword: string) {
    const clientId = process.env.UNSPLASH_CLIENT_ID
    const requestString = `https://api.unsplash.com/photos/random?client_id=${clientId}&query=${keyword}`

		const photo = await this.httpService
			.get(requestString)
			.pipe(map((response) => response.data))
			.toPromise()

		const file = await this.downloadPhoto(photo.id, keyword, photo.links.download)

		setTimeout(() => {
			this.cropPhoto(file)
		}, 3000)

		return photo
  }

  async cropPhoto(file: any) {
  	const jimp = require('jimp')

		const image = await jimp.read(file.filePath)
		const font = await jimp.loadFont(jimp.FONT_SANS_128_BLACK)

		image.cover(1080, 1080)

		const overlay = await jimp.read('./hashtag.png');

		image.blit(overlay, 0, 0);

		await image.writeAsync(`${file.directory}/${file.id}_MOD_BLACK.png`)

		return new Promise((resolve, reject) => {
			resolve(true)
		})
	}

  async downloadPhoto(id: string, keyword: string, download: string): Promise<any> {

		const fs = require('fs')

		const directory = `./generations/${keyword}`

		if (!fs.existsSync(directory)){
			fs.mkdirSync(directory)
		}

		const file = `${id}.png`

		const filePath = `${directory}/${file}`

		const writer = fs.createWriteStream(filePath)

		const response = await this.httpService.axiosRef({
			url: download,
			method: 'GET',
			responseType: 'stream',
		})

		response.data.pipe(writer)

		return new Promise((resolve, reject) => {
			writer.on('finish', resolve({ id, directory, file, filePath }))
			writer.on('error', reject)
		})
	}
}
