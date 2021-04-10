import {Component, Element, h, Prop, State} from "@stencil/core"
import {MatchResults} from "@stencil/router"
import {Album} from "../../global/models"
import {lazy_load} from "../../global/app"

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
		await lazy_load(this.el)
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
