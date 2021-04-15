import {Component, h, Host, State} from "@stencil/core"
import {Artist} from "../../global/models"

@Component({
	tag: "page-artists",
	styleUrl: "page-artists.css",
})
export class PageArtists {
	@State() artists: Array<Artist>

	async componentWillLoad() {
		let result = await fetch("/artists")
		this.artists = await result.json()
	}

	render() {
		return (
			<Host class="page_artists_host">
				<h3 class="page_header">Artists</h3>
				<ul>
					{this.artists.map(artist => {
						return (
							<li>
								<stencil-route-link
									url={`/page/albums/${artist.artist_id}`}
								>
									<div class="artist_image">
										<cache-img
											src={`/artists/${artist.artist_id}/image`}
											alt={`image of ${artist.name}`}
											placeholder="/assets/generic_artist.png"
											class="medium"
										/>
									</div>
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
