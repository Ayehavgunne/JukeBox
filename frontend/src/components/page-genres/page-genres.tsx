import {Component, h, State} from "@stencil/core"

@Component({
	tag: "page-genres",
	styleUrl: "page-genres.css",
	shadow: true,
})
export class PageGenres {
	@State() genres: Array<string>

	async componentWillLoad() {
		let result = await fetch("/genres")
		this.genres = await result.json()
	}

	render() {
		return (
			<div>
				<h3>Genres</h3>
				{this.genres.map(genre => {
					return (
						<li>
							{/*<stencil-route-link url={`/page/tracks/${album.album_id}`}>*/}
							{genre}
							{/*</stencil-route-link>*/}
						</li>
					)
				})}
			</div>
		)
	}
}
