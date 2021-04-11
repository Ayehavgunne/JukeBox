import {Component, h, Host, Prop} from "@stencil/core"
import {MatchResults} from "@stencil/router"

@Component({
	tag: "page-playlists",
	styleUrl: "page-playlists.css",
	// shadow: true,
})
export class PagePlaylists {
	@Prop() match: MatchResults

	normalize(name: string): string {
		if (name) {
			return name.substr(0, 1).toUpperCase() + name.substr(1).toLowerCase()
		}
		return ""
	}

	render() {
		if (this.match && this.match.params.name) {
			return (
				<Host class="page_playlist_host">
					<h3>{this.normalize(this.match.params.name)}</h3>
					<div>Nothing here yet. Move along.</div>
				</Host>
			)
		} else {
			return <Host class="page_playlist_host" />
		}
	}
}
