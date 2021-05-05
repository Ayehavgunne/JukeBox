import {ChangeDetectorRef, Component, OnInit, ViewChild} from "@angular/core"
import {ModalComponent} from "../../components/modal/modal.component"
import {PopupMenuComponent} from "../../components/popup-menu/popup-menu.component"
import {ModalConfig, Track} from "../../models"
import {PlayerService} from "../../services/player.service"
import {print} from "../../utils"
import {TracksService} from "../../services/tracks.service"
import {PlaylistsService} from "../../services/playlists.service"
import {UserService} from "../../services/user.service"
import {CookiesService} from "../../services/cookies.service"

@Component({
	selector: "now-playing",
	templateUrl: "./now-playing.component.html",
	styleUrls: ["./now-playing.component.sass"],
})
export class NowPlayingComponent implements OnInit {
	@ViewChild("modal") modal: ModalComponent
	@ViewChild("popup_menu") popup_menu: PopupMenuComponent
	modal_config: ModalConfig = new ModalConfig()

	constructor(
		public player_service: PlayerService,
		private cookies_service: CookiesService,
		private tracks_service: TracksService,
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
