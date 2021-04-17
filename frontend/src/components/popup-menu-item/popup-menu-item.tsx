import {Component, Element, h, Host, Listen, Prop, State} from "@stencil/core"
import {ua_parser} from "../../global/app"

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
	device_type: string

	async componentWillLoad() {
		this.device_type = ua_parser.getDevice().type
	}

	componentDidRender() {
		if (this.show_submenu) {
			document.addEventListener("click", this.doc_hide_menu)
		}
	}

	doc_hide_menu = (event: MouseEvent) => {
		let target = event.target as HTMLElement
		if (this.el !== target && !this.el.contains(target)) {
			this.show_submenu = false
			document.removeEventListener("click", this.doc_hide_menu)
		}
	}

	@Listen("click")
	click_handler(event: MouseEvent) {
		this.click_action(this.data, this.el.closest("popup-menu"), event)
		if (this.contains_submenu) {
			this.toggle_submenu()
		}
	}

	toggle_submenu = () => {
		this.show_submenu = !this.show_submenu
		if (this.show_submenu && this.device_type === "mobile") {
			let parent_menu = this.el.closest(".menu_container") as HTMLDivElement
			parent_menu.style.width = "1px"
			parent_menu.style.padding = "0"
		}
	}

	render() {
		let classes = "submenu"
		if (this.show_submenu) {
			classes = "submenu show"
		}
		return (
			<Host class="popup_menu_item_host">
				<slot />
				<div class={classes}>
					<slot name="submenu" />
				</div>
			</Host>
		)
	}
}
