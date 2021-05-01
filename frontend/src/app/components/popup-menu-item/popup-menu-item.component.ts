import {Component, HostListener, Input, OnInit} from "@angular/core"

@Component({
	selector: "popup-menu-item",
	templateUrl: "./popup-menu-item.component.html",
	styleUrls: ["./popup-menu-item.component.sass"],
})
export class PopupMenuItemComponent implements OnInit {
	@Input() data: any
	@Input() contains_submenu: boolean
	show_submenu = false

	constructor() {}

	ngOnInit(): void {}

	@HostListener("click")
	click_handler() {
		if (this.contains_submenu) {
			this.toggle_submenu()
		}
	}

	toggle_submenu = () => {
		this.show_submenu = !this.show_submenu
	}
}
