import {ChangeDetectorRef, Component, OnInit, ViewChild} from "@angular/core"
import {CookiesService} from "../../services/cookies.service"
import {UserService} from "../../services/user.service"
import {PlaylistsService} from "../../services/playlists.service"
import {ModalComponent} from "../../components/modal/modal.component"
import {ModalConfig} from "../../models"

@Component({
	selector: "home",
	templateUrl: "./home.component.html",
	styleUrls: ["./home.component.sass"],
})
export class HomeComponent implements OnInit {
	@ViewChild("modal") modal: ModalComponent
	modal_config: ModalConfig = new ModalConfig()

	constructor(
		private cookies_service: CookiesService,
		public playlist_service: PlaylistsService,
		private user_service: UserService,
		private change_detector: ChangeDetectorRef,
	) {}

	async ngOnInit() {
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
