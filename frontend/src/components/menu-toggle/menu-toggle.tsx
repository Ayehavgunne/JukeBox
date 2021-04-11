import {Component, h, Listen, Prop} from "@stencil/core"

@Component({
	tag: "menu-toggle",
	styleUrl: "menu-toggle.css",
	// shadow: true,
})
export class MenuToggle {
	@Prop() showing: boolean = true
	@Prop() toggle: () => void
	@Prop() toggling: () => void

	@Listen("click")
	async toggle_menu() {
		this.toggling()
	}

	render() {
		let classes = "hamburger hamburger--arrowalt"
		if (this.showing) {
			classes += " is-active"
		}
		return (
			<button class={classes} type="button">
				<span class="hamburger-box">
					<span class="hamburger-inner" />
				</span>
			</button>
		)
	}
}
