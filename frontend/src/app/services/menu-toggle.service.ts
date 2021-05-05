import {Injectable} from "@angular/core"

@Injectable({
	providedIn: "root",
})
export class MenuToggleService {
	nav_showing: boolean = true

	constructor() {}

	toggle_nav = () => {
		this.nav_showing = !this.nav_showing
	}
}
