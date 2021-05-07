import {ChangeDetectorRef, Component, OnInit, ViewChild} from "@angular/core"
import {ActivatedRoute, Router} from "@angular/router"
import {ModalComponent} from "../../components/modal/modal.component"
import {ModalConfig, Track} from "../../models"
import {TracksService} from "../../services/tracks.service"
import {PlaylistsService} from "../../services/playlists.service"
import {UserService} from "../../services/user.service"
import {UaService} from "../../services/ua.service"
import {print} from "../../utils"
import {CookiesService} from "../../services/cookies.service"

@Component({
	selector: "playlists",
	templateUrl: "./playlists.component.html",
	styleUrls: ["./playlists.component.sass"],
})
export class PlaylistsComponent implements OnInit {
	@ViewChild("modal") modal: ModalComponent
	name: string = ""
	tracks: Track[]
	other_playlist_names: string[]
	modal_config: ModalConfig = new ModalConfig()
	is_mobile: boolean = false

	constructor(
		private route: ActivatedRoute,
		private tracks_service: TracksService,
		public playlist_service: PlaylistsService,
		private user_service: UserService,
		private ua_service: UaService,
		private router: Router,
		private change_detector: ChangeDetectorRef,
		private cookies_service: CookiesService,
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
		this.route.params.subscribe(params => {
			this.name = params["name"] || ""
			this.playlist_service
				.get_tracks(this.user_service.current_user.user_id, this.name)
				.subscribe(tracks => {
					this.tracks = tracks
				})
			this.playlist_service
				.get_names(this.user_service.current_user.user_id)
				.subscribe(names => {
					this.other_playlist_names = names.filter(item => {
						return item !== this.name
					})
				})
		})
	}

	love_this_track(track: Track) {
		print(track)
		this.tracks_service.change_track_love(track.track_id, true).then()
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

	async rename_playlist() {
		this.modal_config.modal_title = "Rename Playlist"
		this.modal_config.show_dismiss_button = true
		this.modal_config.show_input = true
		this.modal.show()
		this.change_detector.detectChanges()
		let response = await this.modal.get_response()
		if (response.accepted) {
			this.playlist_service
				.rename_playlist(
					this.user_service.current_user.user_id,
					this.name,
					response.input,
				)
				.subscribe(names => {
					this.playlist_service.names = names
					this.router.navigateByUrl(`/page/playlist/${response.input}`)
				})
		}
	}

	async delete_playlist() {
		this.modal_config.modal_title = `Are you sure you want to delete playlist <span class="code">${this.name}</span>?`
		this.modal_config.show_dismiss_button = true
		this.modal_config.show_input = false
		this.modal.show()
		this.change_detector.detectChanges()
		let response = await this.modal.get_response()
		if (response.accepted) {
			this.playlist_service
				.delete_playlist(this.user_service.current_user.user_id, this.name)
				.subscribe(names => {
					this.playlist_service.names = names
					this.router.navigateByUrl("/").then()
				})
		}
	}

	async delete_from_playlist(track: Track) {
		this.modal_config.modal_title = `Are you sure you want to delete <span class="code">${track.title}</span> from playlist <span class="code">${this.name}</span>?`
		this.modal_config.show_dismiss_button = true
		this.modal_config.show_input = false
		this.modal.show()
		this.change_detector.detectChanges()
		let response = await this.modal.get_response()
		if (response.accepted) {
			this.playlist_service
				.delete_from_playlist(
					this.name,
					track.track_id,
					this.user_service.current_user.user_id,
				)
				.subscribe(response => {
					if (response === "Success") {
						let index = this.tracks.indexOf(track)
						this.tracks.splice(index, 1)
						this.tracks = [...this.tracks]
					}
				})
		}
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
