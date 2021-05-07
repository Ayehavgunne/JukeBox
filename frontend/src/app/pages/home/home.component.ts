import {Component, OnInit, ViewChild} from "@angular/core"
import {PlaylistsService} from "../../services/playlists.service"
import {ModalComponent} from "../../components/modal/modal.component"
import {ModalConfig} from "../../models"
import {UserService} from "../../services/user.service"
import {UaService} from "../../services/ua.service"
import {CookiesService} from "../../services/cookies.service"
import {Router} from "@angular/router"

@Component({
	selector: "home",
	templateUrl: "./home.component.html",
	styleUrls: ["./home.component.sass"],
})
export class HomeComponent implements OnInit {
	@ViewChild("modal") modal: ModalComponent
	modal_config: ModalConfig = new ModalConfig()

	constructor(
		public playlist_service: PlaylistsService,
		private user_service: UserService,
		private ua_service: UaService,
		private cookies_service: CookiesService,
		private router: Router,
	) {}

	async ngOnInit() {
		if (this.user_service.current_user === undefined) {
			let user_id = Number(this.cookies_service.get("user_id") || 0)
			if (user_id === 0) {
				this.router.navigateByUrl("/login").then()
			}
			let user = await this.user_service.get_user_by_id(user_id).toPromise()
			this.user_service.set_current_user(user)
		}
		this.playlist_service
			.get_names(this.user_service.current_user.user_id)
			.subscribe(names => {
				this.playlist_service.names = names
			})
	}
}
