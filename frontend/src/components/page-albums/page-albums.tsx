import {Component, h, Host, Prop, State} from "@stencil/core"
import {MatchResults} from "@stencil/router"
import {Album} from "../../global/models"

@Component({
	tag: "page-albums",
	styleUrl: "page-albums.css",
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
			<Host class="page_albums_host">
				<h3 class="page_header">Albums</h3>
				<ul>
					{this.albums.map(album => {
						return (
							<li>
								<stencil-route-link
									url={`/page/tracks/${album.album_id}`}
								>
									<div class="albumart">
										<cache-img
											src={`/albums/${album.album_id}/image`}
											alt={`image of ${album.title}`}
											placeholder="/assets/generic_album.png"
											class="medium"
										/>
									</div>
									<div class="name">{album.title}</div>
								</stencil-route-link>
							</li>
						)
					})}
				</ul>
			</Host>
		)
	}
}
