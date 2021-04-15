import {Component, Host, h, State, Element, Method} from "@stencil/core"

@Component({
	tag: "popup-menu",
	styleUrl: "popup-menu.css",
})
export class PopupMenu {
	@Element() el: HTMLPopupMenuElement
	@State() showing = false

	componentDidRender() {
		if (this.showing) {
			document.addEventListener("click", this.doc_hide_menu)
		}
	}

	doc_hide_menu = (event: MouseEvent) => {
		let target = event.target as HTMLElement
		if (this.el !== target && !this.el.contains(target)) {
			this.showing = false
			document.removeEventListener("click", this.doc_hide_menu)
		}
	}

	show_toggle = () => {
		this.showing = !this.showing
	}

	@Method()
	async hide() {
		this.showing = false
	}

	render() {
		let classes = "menu_container"
		if (this.showing) {
			classes = "menu_container show"
		}
		return (
			<Host class="popup_menu_host">
				<div onClick={this.show_toggle}>
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
