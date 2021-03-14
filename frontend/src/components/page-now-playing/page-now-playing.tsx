import {Component, h} from "@stencil/core"

@Component({
	tag: "page-now-playing",
	styleUrl: "page-now-playing.css",
	shadow: true,
})
export class PageNowPlaying {
	render() {
		return (
			<div>
				<h3>Now Playing</h3>
				Nothing here yet. Move along.
			</div>
		)
	}
}
