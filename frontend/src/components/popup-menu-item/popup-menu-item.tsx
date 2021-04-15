import {Component, Element, h, Host, Listen, Prop} from "@stencil/core"

@Component({
	tag: "popup-menu-item",
	styleUrl: "popup-menu-item.css",
})
export class PopupMenuItem {
	@Element() el: HTMLPopupMenuItemElement
	@Prop() data: any
	@Prop() click_action: (any, HTMLPopupMenuElement) => void

	@Listen("click")
	click_handler() {
		this.click_action(this.data, this.el.parentElement.parentElement)
	}

	render() {
		return (
			<Host class="popup_menu_item">
				<slot />
			</Host>
		)
	}
}
