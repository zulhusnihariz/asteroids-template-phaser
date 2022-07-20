import Phaser, { Scene } from 'phaser'

import { SceneKeys } from '~/consts/SceneKeys'
import { TextureKeys } from '~/consts/GameKeys'
import localskins from '../data/skins.json'

import "regenerator-runtime/runtime";
import '~/game/AsteroidPool'
import '~/game/PlayerShip'
import '~/game/ProjectilePool'

interface Nft {
	amount: string
	block_number: string
	block_number_minted: string
	contract_type: string
	last_metadata_sync: string
	last_token_uri_sync: string
	metadata: string
	name: string
	owner_of: string
	symbol: string
	token_address: string
	token_hash: string
	token_id: string
	token_uri: string
	updated_at: string
}

interface Skin {
	attributes: { trait_type: string, value: string }[]
	description: string
	external_url: string
	image: string
	name: string
}

let TEXT_BACKGROUND_COLOR = '#ffecd1'
let SELECTED_TEXT_BACKGROUND_COLOR = '#60ab9a'
export default class Preload extends Phaser.Scene {

	private nfts: Nft[]
	private ship: { key: string, path: string } | null
	private laser: { key: string, path: string } | null

	private container: Phaser.GameObjects.Container

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
		let assets: { images: { key: string; path: string }[] } = { images: [] }

		this.ship = null
		this.laser = null

		this.nfts = await this.GetShipSkins()

		for (const nft of this.nfts) {
			let skin: Skin = JSON.parse(nft.metadata)

			let path = skin.image.split('//')[1]
			let key = path.split('/')[1]
			key = key.split('.')[0]

			assets.images.push({ key: key, path: `${process.env.IPFS_BASE_PATH}/${path}` })
		}

		this.loadAssets(assets)
	}

	private async GetShipSkins() {
		let accs = await window.web3.eth.getAccounts();

		// accs = ['0x244584678E6AE4363c8561e5f58Bd4938eD7c10D']

		let list = await fetch(`https://deep-index.moralis.io/api/v2/${accs[0]}/nft?chain=mumbai&format=decimal`, {
			headers: {
				'Content-Type': 'application/json',
				'X-API-Key': 'yF2EqHpOWCYHgZgwF3nb7TTCOs0inQ7ACAdbZTyukQdxHDtIBwf8MdIoUMGh7CdL'
			},
		})

		let data = await list.json()

		// default ship if no skins
		if (data.result.length === 0) {

			let local: any[] = []

			for (let skin of localskins) {
				let laser = JSON.stringify({ image: skin.laser })
				let ship = JSON.stringify({ image: skin.ship })

				local.push({ metadata: ship })
				local.push({ metadata: laser })
				console.log('localskins', skin);
			}

			return local
		}

		return data.result.filter(skin => {
			return skin.metadata
		})
	}

	private loadAssets(assets: any) {
		new Promise((resolve) => {
			let loader = new Phaser.Loader.LoaderPlugin(this);

			for (const sheet of assets.images) {
				loader.image(sheet.key, sheet.path);
			}

			loader.once(Phaser.Loader.Events.COMPLETE, () => {
				this.buildShipSelectionUI(assets)
				resolve(assets);
			});
			loader.start();
		});
	}

	private buildShipSelectionUI(assets: any) {
		if (this.container) this.container.destroy()
		this.container = this.add.container(this.scale.width / 2, this.scale.height * .5)

		let xShip = -300
		let yShip = -100

		let xLaser = 150
		let yLaser = -100

		let ships = this.add.group()
		let lasers = this.add.group()

		let style = {
			color: 'black',
			backgroundColor: TEXT_BACKGROUND_COLOR,
			fixedWidth: 300
		}

		for (const skin of assets.images) {
			let key = skin.key
			let isShip = key.includes('ship')

			let config = isShip ?
				{ xStep: xShip, yStep: yShip, spriteXOrigin: 0, spriteYOrigin: 0.3 } :
				{ xStep: xLaser, yStep: yLaser, spriteXOrigin: 0, spriteYOrigin: -0.7 }

			let text = this.add.text(config.xStep, config.yStep, `${skin.key}`, style)
				//@ts-ignore
				.setPadding(24, 12)
				.setOrigin(0, 0)
				.setInteractive({ cursor: 'pointer' })
				.on('pointerdown', () => {

					if (isShip) {
						this.resetTextBackgroundColor(ships)
						this.ship = { key: key, path: `${process.env.IPFS_BASE_PATH}/${skin.path}` }
					} else {
						this.resetTextBackgroundColor(lasers)
						this.laser = { key: key, path: `${process.env.IPFS_BASE_PATH}/${skin.path}` }
					}

					text.setBackgroundColor(SELECTED_TEXT_BACKGROUND_COLOR)

					const isBothSelected = this.ship && this.laser

					if (isBothSelected) {
						this.scene.start(SceneKeys.Multiplayer)
						this.scene.start(SceneKeys.Game)
					}
				})


			if (isShip) {
				ships.add(text)
				yShip += 50
			} else {
				lasers.add(text)
				yLaser += 50
			}

			let sprite = this.add.sprite(text.x - 100, text.y, `${key}`)
				.setOrigin(config.spriteXOrigin, config.spriteYOrigin)

			this.container.add(text)
			this.container.add(sprite)
		}
	}

	private resetTextBackgroundColor(group: Phaser.GameObjects.Group) {
		group.children.iterate(el => {
			let text = el as Phaser.GameObjects.Text
			text.setBackgroundColor(TEXT_BACKGROUND_COLOR)
		})
	}

	get texture() {
		return { ship: this.ship, laser: this.laser }
	}
}
