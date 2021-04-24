import {Component, Host, h, State, Element, Method} from "@stencil/core"
import {ua_parser} from "../../global/app"

@Component({
	tag: "popup-menu",
	styleUrl: "popup-menu.css",
})
export class PopupMenu {
	@Element() el: HTMLPopupMenuElement
	@State() showing = false
	device_type: string
	menu_container: HTMLDivElement

	async componentWillLoad() {
		this.device_type = ua_parser.getDevice().type
	}

	componentDidRender() {
		if (this.showing) {
			document.addEventListener("click", this.doc_hide_menu)
		}
	}

	doc_hide_menu = (event: MouseEvent) => {
		let target = event.target as HTMLElement
		if (this.el !== target && !this.el.contains(target)) {
			this.showing = false
			this.menu_container.style.width = ""
			this.menu_container.style.padding = ""
			document.removeEventListener("click", this.doc_hide_menu)
		}
	}

	show_toggle = () => {
		this.showing = !this.showing
		this.menu_container.style.width = ""
		this.menu_container.style.padding = ""
	}

	close = () => {
		this.showing = false
	}

	@Method()
	async hide() {
		this.showing = false
		this.menu_container.style.width = ""
		this.menu_container.style.padding = ""
	}

	render() {
		let menu_classes = "menu_container"
		let background_classes = "popup_background"
		if (this.showing) {
			menu_classes = "menu_container show"
			background_classes = "popup_background show"
		}
		return (
			<Host class="popup_menu_host">
				<div class={background_classes} onClick={this.close} />
				<div onClick={this.show_toggle}>
					<div class="menu_button">
						<div class="circle" />
						<div class="circle" />
						<div class="circle" />
					</div>
				</div>
				<div
					class={menu_classes}
					ref={el => (this.menu_container = el as HTMLDivElement)}
				>
					<slot />
				</div>
			</Host>
		)
	}
}
