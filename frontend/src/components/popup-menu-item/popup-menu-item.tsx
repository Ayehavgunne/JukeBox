import {Component, Element, h, Host, Listen, Prop, State} from "@stencil/core"

@Component({
	tag: "popup-menu-item",
	styleUrl: "popup-menu-item.css",
})
export class PopupMenuItem {
	@Element() el: HTMLPopupMenuItemElement
	@Prop() data: any
	@Prop() click_action: (any, HTMLPopupMenuElement, MouseEvent) => void
	@Prop() contains_submenu: boolean
	@State() show_submenu = false

	@Listen("click")
	click_handler(event: MouseEvent) {
		this.click_action(this.data, this.el.closest("popup-menu"), event)
		if (this.contains_submenu) {
			this.toggle_submenu()
		}
	}

	toggle_submenu = () => {
		this.show_submenu = !this.show_submenu
	}

	render() {
		let classes = "submenu"
		if (this.show_submenu) {
			classes = "submenu show"
		}
		return (
			<Host class="popup_menu_item">
				<slot />
				<div class={classes}>
					<slot name="submenu" />
				</div>
			</Host>
		)
	}
}
