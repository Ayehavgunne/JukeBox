import {Component, h, Prop, State} from "@stencil/core"
import {MatchResults} from "@stencil/router"
import {Album} from "../../global/models"

@Component({
	tag: "page-albums",
	styleUrl: "page-albums.css",
	shadow: true,
})
export class PageAlbums {
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

	render() {
		return (
			<div class="container">
				<h3>Albums</h3>
				{this.albums.map(album => {
					return (
						<li>
							<stencil-route-link url={`/page/tracks/${album.album_id}`}>
								<div class="albumart">
									<img
										src={`/albums/${album.album_id}/image`}
										alt={`image of ${album.title}`}
										class="small"
									/>
								</div>
								<div class="name">{album.title}</div>
							</stencil-route-link>
						</li>
					)
				})}
			</div>
		)
	}
}
