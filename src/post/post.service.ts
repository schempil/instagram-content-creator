import { HttpService, Injectable } from '@nestjs/common';
import { map } from 'rxjs/operators';

const fs = require('fs')
const jimp = require('jimp')
const sizeOf = require('image-size')
const text2png = require('text2png')

@Injectable()
export class PostService {
  constructor(private httpService: HttpService) { }

  async getPostForKeyword(keyword: string): Promise<string> {
    const clientId = process.env.UNSPLASH_CLIENT_ID
    const requestString = `https://api.unsplash.com/photos/random?client_id=${clientId}&query=${keyword}`

		const photo = await this.httpService
			.get(requestString)
			.pipe(map((response) => response.data))
			.toPromise()

		const file = await this.downloadPhoto(photo.id, keyword, photo.links.download)

		const moddedPhotoPath: string = await this.cropPhoto(file, keyword)

		return moddedPhotoPath
  }

  async cropPhoto(file: any, keyword: string): Promise<string> {

		const image = await jimp.read(file.filePath)

		image.cover(1080, 1080)

		const hueSpin = Math.floor(Math.random() * 720) - 360

		image.color([
			{ apply: 'spin', params: [hueSpin] }
		]);

  	const isWhite = Math.round(Math.random()) > 0
		const padding = 30

		const fonts = {
  		Anton: {
  			font: '150px Anton',
				localFontPath: './fonts/Anton/Anton-Regular.ttf',
				localFontName: 'Anton'
			},
  		Dancing_Script: {
  			font: '150px Dancing_Script',
				localFontPath: './fonts/Dancing_Script/DancingScript-VariableFont_wght.ttf',
				localFontName: 'Dancing_Script'
			},
  		Lobster: {
  			font: '150px Lobster',
				localFontPath: './fonts/Lobster/Lobster-Regular.ttf',
				localFontName: 'Lobster'
			},
  		Raleway: {
  			font: '150px Raleway',
				localFontPath: './fonts/Raleway/static/Raleway-Regular.ttf',
				localFontName: 'Raleway'
			},
  		Xanh_Mono: {
  			font: '150px XanhMono',
				localFontPath: './fonts/Xanh_Mono/XanhMono-Regular.ttf',
				localFontName: 'XanhMono'
			}
		}

		const fontValues = Object.values(fonts)
		const font = fontValues[Math.floor(Math.random() * (fontValues.length - 1) + 1)]

		fs.writeFileSync('./hashtag.png', text2png(`#${keyword}`, {
			font: font.font,
			localFontPath: font.localFontPath,
			localFontName: font.localFontName,
			borderWidth: Math.round(Math.random()) > 0 ? 0 : 0,
			borderColor: isWhite ? '#fff' : '#000',
			backgroundColor: !isWhite ? '#fff' : '#000',
			color: isWhite ? '#fff' : '#000',
			padding: padding
		}))

		const overlay = await jimp.read('./hashtag.png');
		const dimensions = sizeOf('./hashtag.png')

		const labelPositions = {
			TOPLEFT: {x: padding, y: padding},
			TOPRIGHT: {x: (1080 - dimensions.width - padding), y: padding},
			BOTTOMLEFT: {x: padding, y: (1080 - dimensions.height - padding)},
			BOTTOMRIGHT: {x: (1080 - dimensions.width - padding), y: (1080 - dimensions.height - padding)},
			CENTERED: {x: (1080 / 2) - (dimensions.width / 2), y: (1080 / 2) - (dimensions.height / 2)},
		}

		const position = Object.values(labelPositions)[Math.floor(Math.random() * (5 - 1) + 1)]

		image.blit(overlay, position.x, position.y)

		const moddedPhotoPath = `${file.directory}/${file.id}_MOD.png`

		await image.writeAsync(moddedPhotoPath)

		return new Promise((resolve, reject) => {
			resolve(`${file.directory}/${file.id}_MOD.png`)
		})
	}

  async downloadPhoto(id: string, keyword: string, download: string): Promise<any> {

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
