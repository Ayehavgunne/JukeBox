import {AfterViewInit, ChangeDetectorRef, Component, ViewChild} from "@angular/core"
import {CookiesService} from "./services/cookies.service"
import {UserService} from "./services/user.service"
import {ModalConfig, User} from "./models"
import {ModalComponent} from "./components/modal/modal.component"
import {print} from "./utils"

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.sass"],
})
export class AppComponent implements AfterViewInit {
	title = "Jukebox"
	playlists: string[] = ["favs", "teest"]
	user: User = {
		user_id: 0,
		username: "",
	}
	modal_config: ModalConfig = new ModalConfig()
	@ViewChild("modal") modal: ModalComponent

	constructor(
		private user_service: UserService,
		private cookies_service: CookiesService,
		private change_detector: ChangeDetectorRef,
	) {}

	async ngAfterViewInit() {
		let user_id: number = Number(this.cookies_service.get("user_id") || 0)
		if (user_id) {
			this.user_service.get_user_by_id(user_id).subscribe(user => {
				this.user = {username: user.username, user_id: user.user_id}
			})
		} else {
			let username: string = await this.get_username()
			if (username) {
				this.user_service.get_user_by_name(username).subscribe(user => {
					this.user = {username: user.username, user_id: user.user_id}
					this.cookies_service.set("user_id", user.user_id + "")
				})
			}
		}
	}

	async get_username(): Promise<string> {
		this.modal_config.modal_title = "What is your username?"
		this.modal_config.show_dismiss_button = false
		this.modal.show()
		this.change_detector.detectChanges()
		let response = await this.modal.get_response()
		return response.input
	}
}
