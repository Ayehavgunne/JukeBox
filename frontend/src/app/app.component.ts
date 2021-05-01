import {AfterViewInit, ChangeDetectorRef, Component, ViewChild} from "@angular/core"
import {CookiesService} from "./services/cookies.service"
import {UserService} from "./services/user.service"
import {ModalConfig} from "./models"
import {ModalComponent} from "./components/modal/modal.component"
import {PlaylistsService} from "./services/playlists.service"
import {print} from "./utils"

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.sass"],
})
export class AppComponent implements AfterViewInit {
	@ViewChild("modal") modal: ModalComponent
	title = "Jukebox"
	modal_config: ModalConfig = new ModalConfig()

	constructor(
		private user_service: UserService,
		private cookies_service: CookiesService,
		private change_detector: ChangeDetectorRef,
		public playlist_service: PlaylistsService,
	) {}

	async ngAfterViewInit() {
		let user_id: number = Number(this.cookies_service.get("user_id") || 0)
		if (user_id) {
			this.user_service.get_user_by_id(user_id).subscribe(user => {
				this.user_service.current_user = {
					username: user.username,
					user_id: user.user_id,
				}
				this.playlist_service
					.get_names(this.user_service.current_user.user_id)
					.subscribe(names => {
						this.playlist_service.names = names
					})
			})
		} else {
			let username: string = await this.get_username()
			if (username) {
				this.user_service.get_user_by_name(username).subscribe(user => {
					if (user.error === "User does not exist") {
						this.user_service.create_user(username).subscribe(user => {
							this.user_service.current_user = {
								username: user.username,
								user_id: user.user_id,
							}
							this.cookies_service.set("user_id", user.user_id + "")
							this.playlist_service
								.get_names(this.user_service.current_user.user_id)
								.subscribe(names => {
									this.playlist_service.names = names
								})
						})
					} else {
						this.user_service.current_user = {
							username: user.username,
							user_id: user.user_id,
						}
						this.cookies_service.set("user_id", user.user_id + "")
						this.playlist_service
							.get_names(this.user_service.current_user.user_id)
							.subscribe(names => {
								this.playlist_service.names = names
							})
					}
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
