import {Component, Host, h, State, Element} from "@stencil/core"

@Component({
	tag: "popup-menu",
	styleUrl: "popup-menu.css",
	// shadow: true,
})
export class PopupMenu {
	@Element() el: HTMLPopupMenuElement
	@State() showing = false

	componentDidRender() {
		if (this.showing) {
			console.log("rendered popup menu")
			document.addEventListener("click", this.doc_hide_menu)
		}
	}

	doc_hide_menu = (event: MouseEvent) => {
		this.showing = false
		let target = event.target as HTMLElement
		console.log(target)
		document.removeEventListener("click", this.doc_hide_menu)
	}

	toggle_show = async () => {
		this.showing = !this.showing
	}

	render() {
		let classes = "menu_container"
		if (this.showing) {
			classes = "menu_container show"
		}
		return (
			<Host class="popup_menu_host">
				<div class="menu_wrapper" onClick={this.toggle_show}>
					<div class="menu_button">
						<div class="circle" />
						<div class="circle" />
						<div class="circle" />
					</div>
				</div>
				<div class={classes}>
					<slot />
				</div>
			</Host>
		)
	}
}
