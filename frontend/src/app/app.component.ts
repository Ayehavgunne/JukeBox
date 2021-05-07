import {OnInit, Component} from "@angular/core"
import {Router} from "@angular/router"
import {ModalConfig} from "./models"
import {PlaylistsService} from "./services/playlists.service"
import {MenuToggleService} from "./services/menu-toggle.service"
import {UserService} from "./services/user.service"
import {CookiesService} from "./services/cookies.service"
import {print} from "./utils"

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.sass"],
})
export class AppComponent implements OnInit {
	title = "Jukebox"
	modal_config: ModalConfig = new ModalConfig()

	constructor(
		public playlist_service: PlaylistsService,
		public menu_toggle_service: MenuToggleService,
		private user_service: UserService,
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
