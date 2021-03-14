import {Component, h, Prop} from "@stencil/core"
import {MatchResults} from "@stencil/router"

@Component({
	tag: "page-playlist",
	styleUrl: "page-playlist.css",
	shadow: true,
})
export class PagePlaylist {
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
				<div>
					<h1>{this.normalize(this.match.params.name)}</h1>
					<div>Nothing here yet. Move along.</div>
				</div>
			)
		}
	}
}
