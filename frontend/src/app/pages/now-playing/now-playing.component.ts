import {ChangeDetectorRef, Component, OnInit, ViewChild} from "@angular/core"
import {ModalComponent} from "../../components/modal/modal.component"
import {PopupMenuComponent} from "../../components/popup-menu/popup-menu.component"
import {ModalConfig, Track} from "../../models"
import {PlaylistsService} from "../../services/playlists.service"
import {UserService} from "../../services/user.service"
import {PlayerService} from "../../services/player.service"
import {UaService} from "../../services/ua.service"
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
	) {}

	async ngOnInit() {
		this.is_mobile = this.ua_service.ua_parser.getDevice().type === "mobile"
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
