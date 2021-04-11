import {Component, Prop, h, Host} from "@stencil/core"
import {MatchResults} from "@stencil/router"

@Component({
	tag: "page-profile",
	styleUrl: "page-profile.css",
	// shadow: true,
})
export class PageProfile {
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
				<Host class="page_profile_host">
					<p>
						Hello {this.normalize(this.match.params.name)}. I don't have
						this implimented yet so make like a tree and do something else.
					</p>
				</Host>
			)
		} else {
			return <Host class="page_profile_host" />
		}
	}
}
