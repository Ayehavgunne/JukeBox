import {ChangeDetectorRef, Component, Input, OnInit, ViewChild} from "@angular/core"
import {ModalConfig, Track} from "../../models"
import {PlaylistsService} from "../../services/playlists.service"
import {UserService} from "../../services/user.service"
import {ModalComponent} from "../modal/modal.component"
import {SetupService} from "../../services/setup.service"
import {PlayerService} from "../../services/player.service"
import {TracksService} from "../../services/tracks.service"

@Component({
	selector: "track-menu",
	templateUrl: "./track-menu.component.html",
	styleUrls: ["./track-menu.component.sass"],
})
export class TrackMenuComponent implements OnInit {
	@ViewChild("modal") modal: ModalComponent
	@Input() track: Track
	@Input() in_playlist?: boolean
	@Input() viewing_queue?: boolean
	@Input() index?: number = 0
	modal_config: ModalConfig = new ModalConfig()
	love_label: string = "Love"
	already_loved: boolean

	constructor(
		public playlist_service: PlaylistsService,
		public setup_service: SetupService,
		private tracks_service: TracksService,
		private player_service: PlayerService,
		private user_service: UserService,
		private change_detector: ChangeDetectorRef,
	) {}

	ngOnInit(): void {
		if (this.in_playlist === undefined) {
			this.in_playlist = false
		}
		if (this.viewing_queue === undefined) {
			this.viewing_queue = false
		}
		this.already_loved =
			this.tracks_service.loved_tracks.indexOf(this.track.track_id) > -1
		if (this.already_loved) {
			this.love_label = "Unlove"
		}
	}

	love_this_track() {
		this.tracks_service
			.change_track_love(this.track.track_id, !this.already_loved)
			.then(() => {
				this.already_loved = !this.already_loved
				if (this.already_loved) {
					this.love_label = "Unlove"
				} else {
					this.love_label = "Love"
				}
			})
	}

	play_track_next() {
		this.player_service.add_next_in_queue(this.track)
	}

	append_track_to_queue() {
		this.player_service.append_to_queue([this.track])
	}

	remove_from_queue() {
		if (this.index) {
			this.player_service.remove_from_queue(this.index)
		}
	}

	async add_to_playlist(name?: string) {
		if (!name) {
			name = await this.get_playlist_name()
		}
		if (!name) {
			return
		}
		this.playlist_service
			.add_to_playlist(
				name,
				this.track.track_id,
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

	async delete_from_playlist() {
		this.modal_config.modal_title = `Are you sure you want to delete <span class="code">${this.track.title}</span> from playlist <span class="code">${this.playlist_service.current_playlist}</span>?`
		this.modal_config.show_dismiss_button = true
		this.modal_config.show_input = false
		this.modal.show()
		this.change_detector.detectChanges()
		let response = await this.modal.get_response()
		if (response.accepted) {
			this.playlist_service
				.delete_from_playlist(
					this.playlist_service.current_playlist,
					this.track.track_id,
					this.user_service.current_user.user_id,
				)
				.subscribe(response => {
					if (response === "Success") {
						let index = this.playlist_service.tracks.indexOf(this.track)
						this.playlist_service.tracks.splice(index, 1)
						this.playlist_service.tracks = [...this.playlist_service.tracks]
					}
				})
		}
	}
}
