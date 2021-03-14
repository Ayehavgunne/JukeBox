import {Component, Event, EventEmitter, h, Listen, Prop} from "@stencil/core"

@Component({
	tag: "menu-toggle",
	styleUrl: "menu-toggle.css",
	shadow: true,
})
export class MenuToggle {
	@Event() toggling: EventEmitter<boolean>
	@Prop() showing: boolean = true
	@Prop() toggle: () => void

	@Listen("click")
	async toggle_menu() {
		this.showing = !this.showing
		this.toggling.emit(this.showing)
	}

	render() {
		let classes = "hamburger--arrowalt"
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
