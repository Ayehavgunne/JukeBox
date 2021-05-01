import {ChangeDetectorRef, Component, OnInit, ViewChild} from "@angular/core"
import {ActivatedRoute} from "@angular/router"
import {ModalConfig, Track} from "../../models"
import {TracksService} from "../../services/tracks.service"
import {PlaylistsService} from "../../services/playlists.service"
import {UserService} from "../../services/user.service"
import {ModalComponent} from "../../components/modal/modal.component"
import {print} from "../../utils"

@Component({
	selector: "tracks",
	templateUrl: "./tracks.component.html",
	styleUrls: ["./tracks.component.sass"],
})
export class TracksComponent implements OnInit {
	tracks?: Track[]
	playlists: string[] = []
	show_headers: boolean = true
	@ViewChild("modal") modal: ModalComponent
	modal_config: ModalConfig = new ModalConfig()

	constructor(
		private route: ActivatedRoute,
		private tracks_service: TracksService,
		public playlist_service: PlaylistsService,
		private user_service: UserService,
		private change_detector: ChangeDetectorRef,
	) {}

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
		print(track, name)
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

	ngOnInit(): void {
		this.route.params.subscribe(params => {
			let track_id = Number(params["track"] || 0)
			if (track_id) {
				this.tracks_service.get_tracks(track_id).subscribe(tracks => {
					this.tracks = tracks
				})
			} else {
				this.tracks_service.get_tracks().subscribe(tracks => {
					this.tracks = tracks
				})
			}
		})
	}
}
