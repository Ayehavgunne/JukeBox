import {Component, HostListener, Injector, Input, OnInit} from "@angular/core"
import {PopupMenuComponent} from "../popup-menu/popup-menu.component"

@Component({
	selector: "popup-menu-item",
	templateUrl: "./popup-menu-item.component.html",
	styleUrls: ["./popup-menu-item.component.sass"],
})
export class PopupMenuItemComponent implements OnInit {
	@Input() contains_submenu?: boolean
	parent?: PopupMenuComponent
	show_submenu = false

	constructor(private injector: Injector) {
		this.parent = this.injector.get<PopupMenuComponent>(PopupMenuComponent)
	}

	ngOnInit(): void {}

	@HostListener("click")
	click_handler() {
		if (this.contains_submenu) {
			this.toggle_submenu()
		} else {
			this.parent?.close()
		}
	}

	toggle_submenu = () => {
		this.show_submenu = !this.show_submenu
	}
}
