import {Component, Element, h, State} from "@stencil/core"
import {Artist} from "../../global/models"

@Component({
	tag: "page-artists",
	styleUrl: "page-artists.css",
	shadow: true,
})
export class PageArtists {
	@Element() el: HTMLPageArtistsElement
	@State() artists: Array<Artist>

	async componentWillLoad() {
		let result = await fetch("/artists")
		this.artists = await result.json()
	}

	async componentDidRender() {
		await this.lazy_load()
	}

	lazy_load = async () => {
		let lazyloadImages
		if ("IntersectionObserver" in window) {
			lazyloadImages = this.el.shadowRoot.querySelectorAll(".lazy")
			let imageObserver = new IntersectionObserver(function (entries) {
				entries.forEach(function (entry) {
					if (entry.isIntersecting) {
						// @ts-ignore
						let image: HTMLImageElement = entry.target
						image.src = image.dataset.src
						image.classList.remove("lazy")
						imageObserver.unobserve(image)
					}
				})
			})

			lazyloadImages.forEach(function (image) {
				imageObserver.observe(image)
			})
		} else {
			let lazyloadThrottleTimeout
			lazyloadImages = document.querySelectorAll(".lazy")

			let lazyload = () => {
				if (lazyloadThrottleTimeout) {
					clearTimeout(lazyloadThrottleTimeout)
				}

				lazyloadThrottleTimeout = setTimeout(function () {
					let scrollTop = window.pageYOffset
					lazyloadImages.forEach(function (img) {
						if (img.offsetTop < window.innerHeight + scrollTop) {
							img.src = img.dataset.src
							img.classList.remove("lazy")
						}
					})
					if (lazyloadImages.length == 0) {
						document.removeEventListener("scroll", lazyload)
						window.removeEventListener("resize", lazyload)
						window.removeEventListener("orientationChange", lazyload)
					}
				}, 20)
			}

			document.addEventListener("scroll", lazyload)
			window.addEventListener("resize", lazyload)
			window.addEventListener("orientationChange", lazyload)
		}
	}

	render() {
		return (
			<div class="container">
				<h3>Artists</h3>
				<ul>
					{this.artists.map((artist, index) => {
						let image
						if (index < 15) {
							image = (
								<img
									src={`/artists/${artist.artist_id}/image`}
									alt={`image of ${artist.name}`}
									class="small"
								/>
							)
						} else {
							image = (
								<img
									src=""
									data-src={`/artists/${artist.artist_id}/image`}
									alt={`image of ${artist.name}`}
									class="small lazy"
								/>
							)
						}
						return (
							<li>
								<stencil-route-link
									url={`/page/albums/${artist.artist_id}`}
								>
									<div class="artist_image">{image}</div>
									<div class="name">{artist.name}</div>
								</stencil-route-link>
							</li>
						)
					})}
				</ul>
			</div>
		)
	}
}
