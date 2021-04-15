import {Component, Host, h} from "@stencil/core"

@Component({
	tag: "page-settings",
	styleUrl: "page-settings.css",
})
export class PageSettings {
	scan_files = async () => {
		await fetch("/task/scan_files")
	}
	get_artist_images = async () => {
		await fetch("/task/get_artist_images")
	}

	render() {
		return (
			<Host class="page_settings_host">
				<h3 class="page_header">Tasks</h3>
				<button onClick={this.scan_files}>Scan Music</button>
				<button onClick={this.get_artist_images}>Get Artist Images</button>
			</Host>
		)
	}
}
