import {Component, Element, h, Host, State} from "@stencil/core"
import {Artist} from "../../global/models"
import {lazy_load} from "../../global/app"

@Component({
	tag: "page-artists",
	styleUrl: "page-artists.css",
	// shadow: true,
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
			<Host class="page_artists_host">
				<h3>Artists</h3>
				<ul>
					{this.artists.map((artist, index) => {
						let image
						if (index < 15) {
							image = (
								<img
									src={`/artists/${artist.artist_id}/image`}
									alt={`image of ${artist.name}`}
									class="medium"
								/>
							)
						} else {
							image = (
								<img
									src=""
									data-src={`/artists/${artist.artist_id}/image`}
									alt={`image of ${artist.name}`}
									class="medium lazy"
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
			</Host>
		)
	}
}
