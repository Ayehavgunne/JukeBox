import {OnInit, Component} from "@angular/core"
import {Router} from "@angular/router"
import {ModalConfig} from "./models"
import {PlaylistsService} from "./services/playlists.service"
import {MenuToggleService} from "./services/menu-toggle.service"
import {UserService} from "./services/user.service"
import {CookiesService} from "./services/cookies.service"
import {UaService} from "./services/ua.service"
import {print} from "./utils"

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.sass"],
})
export class AppComponent implements OnInit {
	title = "Jukebox"
	modal_config: ModalConfig = new ModalConfig()
	mobile: boolean = false

	constructor(
		public menu_toggle_service: MenuToggleService,
		public playlist_service: PlaylistsService,
		private user_service: UserService,
		private ua_service: UaService,
		private cookies_service: CookiesService,
		private router: Router,
	) {}

	async ngOnInit() {
		this.mobile = this.ua_service.ua_parser.getDevice().type === "mobile"
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
