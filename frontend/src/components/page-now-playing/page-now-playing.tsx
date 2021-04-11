import {Component, h, Host} from "@stencil/core"

@Component({
	tag: "page-now-playing",
	styleUrl: "page-now-playing.css",
	// shadow: true,
})
export class PageNowPlaying {
	render() {
		return (
			<Host class="page_now_playing_host">
				<h3>Now Playing</h3>
				Nothing here yet. Move along.
			</Host>
		)
	}
}
