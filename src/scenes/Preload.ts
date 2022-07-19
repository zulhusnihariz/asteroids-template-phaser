import Phaser, { Scene } from 'phaser'

import { SceneKeys } from '~/consts/SceneKeys'
import { TextureKeys } from '~/consts/GameKeys'
import skins from '../data/skins.json'

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
		let assets: { images: any } = { images: [] }

		for (const skin of skins) {
			let laserKey = skin.laser.split('/')[1]
			let shipKey = skin.ship.split('/')[1]

			laserKey = laserKey.split('.')[0]
			shipKey = shipKey.split('.')[0]

			assets.images.push({ key: laserKey, path: `${process.env.IPFS_BASE_PATH}/${skin.laser}` })
			assets.images.push({ key: shipKey, path: `${process.env.IPFS_BASE_PATH}/${skin.ship}` })
		}

		this.loadAssets(assets)
	}

	loadAssets(assets: any) {
		new Promise((resolve) => {
			let loader = new Phaser.Loader.LoaderPlugin(this);

			for (const sheet of assets.images) {
				loader.image(sheet.key, sheet.path);
			}

			loader.once(Phaser.Loader.Events.COMPLETE, () => {
				this.buildShipSelectionUI()
				resolve(assets);
			});
			loader.start();
		});
	}

	private buildShipSelectionUI() {
		let container = this.add.container(this.scale.width / 2, this.scale.height * .5)

		let style = {
			color: 'black',
			backgroundColor: '#FFECD1',
			fixedWidth: 300
		}

		let yStep = -100

		for (const skin of skins) {
			let laserKey = skin.laser.split('/')[1]
			let shipKey = skin.ship.split('/')[1]
			laserKey = laserKey.split('.')[0]
			shipKey = shipKey.split('.')[0]

			let text = this.add.text(-100, yStep, `${skin.name}`, style)
				.setPadding(24, 12)
				.setOrigin(0, 0)
				.setInteractive({ cursor: 'pointer' })
				.on('pointerdown', () => {

					this.ship = { key: shipKey, path: `${process.env.IPFS_BASE_PATH}/${skin.ship}` }
					this.laser = { key: laserKey, path: `${process.env.IPFS_BASE_PATH}/${skin.laser}` }

					this.scene.start(SceneKeys.Multiplayer)
					this.scene.start(SceneKeys.Game)
				})

			let ship = this.add.sprite(text.x - 100, text.y, `${shipKey}`).setOrigin(0, 0.3)
			container.add(text)
			container.add(ship)
			yStep += 50
		}
	}
	get texture() {
		return { ship: this.ship, laser: this.laser }
	}
}
