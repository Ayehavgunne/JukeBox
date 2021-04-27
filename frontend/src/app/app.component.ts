import {Component, OnInit} from "@angular/core"
import {CookiesService} from "./services/cookies.service"
import {UserService} from "./services/user.service"
import {User} from "./models"
import {ModalComponent} from "./components/modal/modal.component"

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.sass"],
})
export class AppComponent implements OnInit {
	title = "Jukebox"
	playlists: string[] = ["favs", "teest"]
	user: User = {
		user_id: 0,
		username: "",
	}

	constructor(
		private user_service: UserService,
		private cookies_service: CookiesService,
	) {}

	async ngOnInit() {
		let user_id: number = Number(this.cookies_service.get("user_id") || 0)
		if (user_id) {
			this.user_service.get_user_by_id(user_id).subscribe(user => {
				this.user = user
			})
		} else {
			let username: string = await this.get_username()
			this.user_service.get_user_by_name(username)
		}
	}

	async get_username(): Promise<string> {
		let modal = new ModalComponent()
		modal.show()
		return await modal.get_response()
	}
}
