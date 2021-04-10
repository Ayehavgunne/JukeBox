import {Component, Element, h, State} from "@stencil/core"
import {Artist} from "../../global/models"
import {lazy_load} from "../../global/app"

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
		await lazy_load(this.el)
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
