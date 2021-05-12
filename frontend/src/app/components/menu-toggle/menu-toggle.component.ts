import {Component, HostListener, Input, OnInit} from "@angular/core"
import {MenuToggleService} from "../../services/menu-toggle.service"

@Component({
	selector: "menu-toggle",
	templateUrl: "./menu-toggle.component.html",
	styleUrls: ["./menu-toggle.component.sass"],
})
export class MenuToggleComponent implements OnInit {
	@Input() showing: boolean = true

	constructor(public menu_toggle_service: MenuToggleService) {}

	ngOnInit(): void {}

	@HostListener("click")
	async toggle_menu() {
		this.menu_toggle_service.toggle_nav()
	}
}
