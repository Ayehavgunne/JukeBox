import {Component, h, Host, State} from "@stencil/core"

@Component({
	tag: "page-genres",
	styleUrl: "page-genres.css",
})
export class PageGenres {
	@State() genres: Array<string>

	async componentWillLoad() {
		let result = await fetch("/genres")
		this.genres = await result.json()
	}

	render() {
		return (
			<Host class="page_genres_host">
				<h3 class="page_header">Genres</h3>
				{this.genres.map(genre => {
					return (
						<li>
							{/*<stencil-route-link url={`/page/tracks/${album.album_id}`}>*/}
							{genre}
							{/*</stencil-route-link>*/}
						</li>
					)
				})}
			</Host>
		)
	}
}
