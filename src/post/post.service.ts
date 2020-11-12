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

		await this.cropPhoto(file, keyword)

		return photo
  }

  async cropPhoto(file: any, keyword: string) {
  	const jimp = require('jimp')
		const sizeOf = require('image-size')
		const fs = require('fs')
		const text2png = require('text2png')

		const image = await jimp.read(file.filePath)

		image.cover(1080, 1080)
		//image.blur(5)
		//image.sepia()
		//image.gaussian(15)

		const hueSpin = Math.floor(Math.random() * 361) - 360

		// LeanSip: 224

		image.color([
			{ apply: 'spin', params: [hueSpin] }
		]);

  	const color = Math.round(Math.random()) > 0 ? '#000' : '#FFF'

		fs.writeFileSync('./hashtag.png', text2png(`#${keyword}`, {
			font: '150px Lobster',
			localFontPath: './fonts/Lobster/Lobster-Regular.ttf',
			localFontName: 'Lobster',
			borderWidth: Math.round(Math.random()) > 0 ? 10 : 0,
			borderColor: color,
			color: color,
			padding: 30
		}))

		const overlay = await jimp.read('./hashtag.png');
		const dimensions = sizeOf('./hashtag.png')

		const labelPositions = {
			TOPLEFT: {x: 20, y: 20},
			TOPRIGHT: {x: (1080 - dimensions.width - 20), y: 20},
			BOTTOMLEFT: {x: 20, y: (1080 - dimensions.height - 20)},
			BOTTOMRIGHT: {x: (1080 - dimensions.width - 20), y: (1080 - dimensions.height - 20)},
			CENTERED: {x: (1080 / 2) - (dimensions.width / 2), y: (1080 / 2) - (dimensions.height / 2)},
		}

		const randomPosition = Math.floor(Math.random() * (5 - 1) + 1)

		const position = Object.values(labelPositions)[randomPosition]

		image.blit(overlay, position.x, position.y)

		await image.writeAsync(`${file.directory}/${file.id}_MOD.png`)

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
			writer.on('finish', () => {
				writer.end(resolve({ id, directory, file, filePath }))
			})
			writer.on('error', reject)
		})
	}
}
