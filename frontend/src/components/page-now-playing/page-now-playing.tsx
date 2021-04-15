import {Component, h, Host} from "@stencil/core"

@Component({
	tag: "page-now-playing",
	styleUrl: "page-now-playing.css",
})
export class PageNowPlaying {
	render() {
		return (
			<Host class="page_now_playing_host">
				<h3 class="page_header">Now Playing</h3>
				Nothing here yet. Move along.
			</Host>
		)
	}
}
