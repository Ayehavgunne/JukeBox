import {Component, h} from "@stencil/core"

@Component({
	tag: "page-home",
	styleUrl: "page-home.css",
	shadow: true,
})
export class PageHome {
	render() {
		return (
			<div>
				<p>
					This is Jukebox. Something interesting should go here but I don't
					know what yet. For now click on an option in the navigation panel on
					the left.
				</p>
			</div>
		)
	}
}
