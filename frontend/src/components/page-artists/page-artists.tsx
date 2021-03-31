import {Component, h, State} from "@stencil/core"
import {Artist} from "../../global/models"

@Component({
	tag: "page-artists",
	styleUrl: "page-artists.css",
	shadow: true,
})
export class PageArtists {
	@State() artists: Array<Artist>

	async componentWillLoad() {
		let result = await fetch("/artists")
		this.artists = await result.json()
	}

	render() {
		return (
			<div class="container">
				<h3>Artists</h3>
				<ul>
					{this.artists.map(artist => {
						return (
							<li>
								<stencil-route-link
									url={`/page/albums/${artist.artist_id}`}
								>
									<img
										src={`/artists/${artist.artist_id}/image`}
										alt={`image of ${artist.name}`}
										class="small"
									/>
									{artist.name}
								</stencil-route-link>
							</li>
						)
					})}
				</ul>
			</div>
		)
	}
}
