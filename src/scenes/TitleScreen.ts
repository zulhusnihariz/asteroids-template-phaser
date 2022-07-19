import Phaser from 'phaser'

import PlayButton from '~/UI/PlayButton'
import { SceneKeys } from '~/consts/SceneKeys'

import WebFontFile from '~/UI/WebFontFile'
import Web3Modal from 'web3modal'
import Web3 from 'web3'
import WalletConnectProvider from '@walletconnect/web3-provider';
import "regenerator-runtime/runtime";

export default class TitleScreen extends Phaser.Scene {
	preload() {
		this.cameras.main.setBackgroundColor('rgba(32,44,64,1)')

		const file = new WebFontFile(this.load, [
			'Righteous',
			'Fredoka One'
		])
		this.load.addFile(file)
	}

	async create() {
		const width = this.scale.width
		const height = this.scale.height
		const x = width * 0.5

		const y = height * 0.7

		const playButton = this.add.dom(x, height + 50, PlayButton)
		playButton.addListener('click').on('click', () => {
			this.scene.start(SceneKeys.Preload)
		})

		const timeline = this.tweens.createTimeline()

		// https://github.com/photonstorm/phaser/blob/v3.22.0/src/math/easing/EaseMap.js


		timeline.add({
			targets: playButton,
			y,
			ease: 'Quad.easeOut',
			duration: 400,
			offset: 350
		})

		timeline.play()

		await this.displayWeb3Modal()
	}

	private initWeb3(provider: any) {
		const web3: any = new Web3(provider);

		web3.eth.extend({
			methods: [
				{
					name: 'chainId',
					call: 'eth_chainId',
					outputFormatter: web3.utils.hexToNumber,
				},
			],
		});

		return web3;
	}

	private async displayWeb3Modal(): Promise<number> {
		return new Promise(async (resolve, reject) => {
			const providerOptions = {
				walletconnect: {
					package: WalletConnectProvider,
					options: {
						rpc: {
							56: 'https://bsc-dataseed.binance.org',
						},
						network: 'binance',
					},
				},
			};

			const web3Modal = new Web3Modal({
				providerOptions: providerOptions,
			});

			try {
				const provider = await web3Modal.connect();

				const web3const = this.initWeb3(provider);

				window.web3 = web3const;
				const accs = await web3const.eth.getAccounts();
				resolve(accs[0]);
			} catch (err) {
				this.displayWeb3Modal()

			}

		});
	}
}
