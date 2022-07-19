import Phaser, { Scene } from 'phaser'

import { SceneKeys } from '~/consts/SceneKeys'
import { TextureKeys } from '~/consts/GameKeys'

import "regenerator-runtime/runtime";
import '~/game/AsteroidPool'
import '~/game/PlayerShip'
import '~/game/ProjectilePool'

export default class Preload extends Phaser.Scene {

	private ship: { key: string, path: string }
	private laser: { key: string, path: string }

	async preload() {
		this.load.setPath('assets/game/')

		this.load.image(TextureKeys.AsteroidBig1, 'meteorBrown_big1.png')
		this.load.image(TextureKeys.AsteroidBig2, 'meteorBrown_big2.png')
		this.load.image(TextureKeys.AsteroidBig3, 'meteorBrown_big3.png')
		this.load.image(TextureKeys.AsteroidBig4, 'meteorBrown_big4.png')

		this.load.image(TextureKeys.AsteroidMedium1, 'meteorBrown_med1.png')
		this.load.image(TextureKeys.AsteroidMedium2, 'meteorBrown_med2.png')

		this.load.image(TextureKeys.AsteroidSmall1, 'meteorBrown_small1.png')
		this.load.image(TextureKeys.AsteroidSmall2, 'meteorBrown_small2.png')

		this.load.image(TextureKeys.Particles1, 'star_04.png')
	}

	async create() {
		let LASER_PATH = `${process.env.IPFS_BASE_PATH}/bafybeia5qixe25zdpwc5s6bbbu3czrib7h4loxm4ofvfhlubc7hvlb4q3u/2.json`
		let SHIP_PATH = `${process.env.IPFS_BASE_PATH}/bafybeihgomolp7vzmrfh35pmbknp6fycqc354smiookys3mtadmhdtrlje/1.json`

		let ship: any = await fetch(`${SHIP_PATH}`)
		let laser: any = await fetch(`${LASER_PATH}`)

		ship = await ship.json()
		laser = await laser.json()

		let shipImage = ship.image.split('//')
		let laserImage = laser.image.split('//')

		let skins = [
			{
				laser: 'bafybeibnbvbswbwoeivs5ejmxqcj5g54alibgtzzydgvhqtmmu7le2vlre/DOSA1-laser-blue-OG-0001.png',
				ship: 'bafybeifft6ugdvzhnbnaqwphhoxirzpoqbzgkpylajd4f3nhy7mualvs3y/DOSA1-ship-blue-OG-0001.png'
			},
			{
				laser: 'bafybeifsu2lrwyplmxpdafskgvp4lafmnkuj3ggde2q2vf5qjpbiu5ryka/DOSA1-laser-red-0002.png',
				ship: 'bafybeiddaltniuodlvytiz32i7mm2lg4mf2lk22vig3qmnjmtnenwewf2m/DOSA1-ship-red-0002.png'
			},
			{
				laser: 'bafybeiew33rtxfiyjiy7xuom65pdpqkp4ecbklsu2efarhszutm64mbkr4/DOSA1-laser-yellow-0003.png',
				ship: 'bafybeifft6ugdvzhnbnaqwphhoxirzpoqbzgkpylajd4f3nhy7mualvs3y/DOSA1-ship-blue-OG-0001.png'
			},
			{
				laser: 'bafybeibyw2llpv63jajerhykovohevxqpp4vgvymglmxmqw3yylvtshbfy/DOSA1-laser-blue-0004.png',
				ship: 'bafybeifvcql7y3mwo7yevh734b3655c6bbddcnres64ntxqb5e5rrcqwru/DOSA1-ship-yellowgreen-0003.png'
			}]

		let selectedSkin = skins[Math.floor(Math.random() * skins.length)]

		let lkey = selectedSkin.laser.split('/')
		let skey = selectedSkin.ship.split('/')

		this.ship = { key: skey[1], path: `${process.env.IPFS_BASE_PATH}/${selectedSkin.ship}` }
		this.laser = { key: lkey[1], path: `${process.env.IPFS_BASE_PATH}/${selectedSkin.laser}` }

		let assets: { images: any } = { images: [] }
		let images = [this.ship, this.laser]

		assets.images = images
		this.loadAssets(assets)
	}

	loadAssets(assets: any) {
		new Promise((resolve) => {
			let loader = new Phaser.Loader.LoaderPlugin(this);

			for (const sheet of assets.images) {
				loader.image(sheet.key, sheet.path);
			}

			loader.once(Phaser.Loader.Events.COMPLETE, () => {
				this.scene.start(SceneKeys.Multiplayer)
				this.scene.start(SceneKeys.Game)
				resolve(assets);
			});
			loader.start();
		});
	}

	get texture() {
		return { ship: this.ship, laser: this.laser }
	}
}
