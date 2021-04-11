import {Component, h, Host, Prop} from "@stencil/core"

@Component({
	tag: "popup-menu-item",
	styleUrl: "popup-menu-item.css",
	// shadow: true,
})
export class PopupMenuItem {
	@Prop() data
	render() {
		return (
			<Host class="popup_menu_item">
				<slot />
			</Host>
		)
	}
}
