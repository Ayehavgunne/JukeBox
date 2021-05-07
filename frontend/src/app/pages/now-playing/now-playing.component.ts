import {ChangeDetectorRef, Component, OnInit, ViewChild} from "@angular/core"
import {ModalComponent} from "../../components/modal/modal.component"
import {PopupMenuComponent} from "../../components/popup-menu/popup-menu.component"
import {ModalConfig, Track} from "../../models"
import {PlaylistsService} from "../../services/playlists.service"
import {UserService} from "../../services/user.service"
import {PlayerService} from "../../services/player.service"
import {UaService} from "../../services/ua.service"
import {CookiesService} from "../../services/cookies.service"
import {Router} from "@angular/router"
import {print} from "../../utils"

@Component({
	selector: "now-playing",
	templateUrl: "./now-playing.component.html",
	styleUrls: ["./now-playing.component.sass"],
})
export class NowPlayingComponent implements OnInit {
	@ViewChild("modal") modal: ModalComponent
	@ViewChild("popup_menu") popup_menu: PopupMenuComponent
	modal_config: ModalConfig = new ModalConfig()
	is_mobile: boolean = false

	constructor(
		public player_service: PlayerService,
		public playlist_service: PlaylistsService,
		private user_service: UserService,
		private ua_service: UaService,
		private change_detector: ChangeDetectorRef,
		private cookies_service: CookiesService,
		private router: Router,
	) {}

	async ngOnInit() {
		this.is_mobile = this.ua_service.ua_parser.getDevice().type === "mobile"
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

	love_this_track(track: Track) {
		print(track)
	}

	play_track_next(track: Track) {
		print(track)
	}

	append_track_to_queue(track: Track) {
		print(track)
	}

	async add_to_playlist(track: Track, name?: string) {
		if (!name) {
			name = await this.get_playlist_name()
		}
		this.playlist_service
			.add_to_playlist(
				name,
				track.track_id,
				this.user_service.current_user.user_id,
			)
			.subscribe()
	}

	async get_playlist_name(): Promise<string> {
		this.modal_config.modal_title = "Playlist Name?"
		this.modal_config.show_dismiss_button = true
		this.modal.show()
		this.change_detector.detectChanges()
		let response = await this.modal.get_response()
		return response.input
	}
}
