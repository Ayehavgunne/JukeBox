import {Component, OnInit} from "@angular/core"
import {print} from "../../utils"

@Component({
	selector: "popup-menu",
	templateUrl: "./popup-menu.component.html",
	styleUrls: ["./popup-menu.component.sass"],
})
export class PopupMenuComponent implements OnInit {
	showing = false

	constructor() {}

	ngOnInit(): void {}

	show_toggle = () => {
		this.showing = !this.showing
	}

	close = () => {
		this.showing = false
	}
}
