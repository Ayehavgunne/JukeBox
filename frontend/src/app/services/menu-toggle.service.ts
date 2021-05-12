import {Injectable} from "@angular/core"
import {UaService} from "./ua.service"

@Injectable({
	providedIn: "root",
})
export class MenuToggleService {
	nav_showing: boolean = true

	constructor(private ua_service: UaService) {
		if (this.ua_service.ua_parser.getDevice().type === "mobile") {
			this.nav_showing = false
		}
	}

	toggle_nav = (mobile?: boolean): void => {
		if (mobile !== undefined) {
			if (mobile) {
				this.nav_showing = !this.nav_showing
			}
			return
		}
		this.nav_showing = !this.nav_showing
	}
}
