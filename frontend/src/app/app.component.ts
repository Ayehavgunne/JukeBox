import {AfterViewInit, ChangeDetectorRef, Component, ViewChild} from "@angular/core"
import {CookiesService} from "./services/cookies.service"
import {UserService} from "./services/user.service"
import {ModalConfig} from "./models"
import {ModalComponent} from "./components/modal/modal.component"
import {PlaylistsService} from "./services/playlists.service"
import {MenuToggleService} from "./services/menu-toggle.service"

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
		public menu_toggle_service: MenuToggleService,
	) {}

	async ngAfterViewInit() {
		if (this.user_service.current_user === undefined) {
			await this.user_service.set_current_user(
				this.cookies_service,
				this.playlist_service,
				this.modal,
				this.modal_config,
				this.change_detector,
			)
		}
	}
}
