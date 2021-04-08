import {Component, Element, h, Prop, State} from "@stencil/core"
import {MatchResults} from "@stencil/router"
import {Album} from "../../global/models"

@Component({
	tag: "page-albums",
	styleUrl: "page-albums.css",
	shadow: true,
})
export class PageAlbums {
	@Element() el: HTMLPageAlbumsElement
	@Prop() match: MatchResults
	@State() albums: Array<Album>

	async componentWillLoad() {
		let url = "/albums"
		if (this.match && this.match.params.artist_id) {
			url = `/artists/${this.match.params.artist_id}/albums`
		}
		let result = await fetch(url)
		this.albums = await result.json()
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
				<h3>Albums</h3>
				<ul>
					{this.albums.map((album, index) => {
						let image
						if (index < 15) {
							image = (
								<img
									src={`/albums/${album.album_id}/image`}
									alt={`image of ${album.title}`}
									class="small"
								/>
							)
						} else {
							image = (
								<img
									src=""
									data-src={`/albums/${album.album_id}/image`}
									alt={`image of ${album.title}`}
									class="small lazy"
								/>
							)
						}
						return (
							<li>
								<stencil-route-link
									url={`/page/tracks/${album.album_id}`}
								>
									<div class="albumart">{image}</div>
									<div class="name">{album.title}</div>
								</stencil-route-link>
							</li>
						)
					})}
				</ul>
			</div>
		)
	}
}
