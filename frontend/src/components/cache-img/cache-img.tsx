import {Component, Element, h, Prop, State, Watch} from "@stencil/core"
import store from "../../global/store"

@Component({
	tag: "cache-img",
	styleUrl: "cache-img.css",
})
export class CacheImg {
	@Element() el: HTMLElement
	@Prop() src: string
	@Prop() alt: string
	@Prop() class?: string
	@Prop() placeholder?: string
	@State() load_src: string
	io?: IntersectionObserver

	async componentWillLoad() {
		let src = this.placeholder
		if (this.placeholder) {
			if (this.placeholder in store.images) {
				this.load_src = store.images[this.placeholder]
			} else {
				await this.fetch_image(src)
			}
		}
	}

	fetch_image = async src => {
		let self = this
		let response = await fetch(src)
		let blob = await response.blob()
		let reader = new FileReader()
		reader.onload = function () {
			let result = this.result.toString()
			store.images[src] = result
			self.load_src = result
		}
		reader.readAsDataURL(blob)
	}

	async componentDidLoad() {
		await this.add_io()
	}

	add_io = async () => {
		if (this.src === undefined) {
			return
		}

		if ("IntersectionObserver" in window) {
			await this.remove_io()
			this.io = new IntersectionObserver(async data => {
				if (data[0].isIntersecting) {
					await this.load()
					await this.remove_io()
				}
			})

			this.io.observe(this.el)
		} else {
			setTimeout(async () => await this.load(), 200)
		}
	}

	load = async () => {
		let src = this.src
		if (src in store.images) {
			this.load_src = store.images[src]
		} else {
			await this.fetch_image(src)
		}
	}

	remove_io = async () => {
		if (this.io) {
			this.io.disconnect()
			this.io = undefined
		}
	}

	@Watch("src")
	async src_changed() {
		await this.add_io()
	}

	render() {
		if (this.class === undefined) {
			this.class = ""
		}
		return <img src={this.load_src} alt={this.alt} class={this.class} />
	}
}
