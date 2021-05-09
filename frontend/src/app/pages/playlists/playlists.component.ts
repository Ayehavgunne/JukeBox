import {ChangeDetectorRef, Component, OnInit, ViewChild} from "@angular/core"
import {ActivatedRoute, Router} from "@angular/router"
import {ModalComponent} from "../../components/modal/modal.component"
import {ModalConfig, Track} from "../../models"
import {TracksService} from "../../services/tracks.service"
import {PlaylistsService} from "../../services/playlists.service"
import {UserService} from "../../services/user.service"
import {UaService} from "../../services/ua.service"
import {SetupService} from "../../services/setup.service"
import {print} from "../../utils"

@Component({
	selector: "playlists",
	templateUrl: "./playlists.component.html",
	styleUrls: ["./playlists.component.sass"],
})
export class PlaylistsComponent implements OnInit {
	@ViewChild("modal") modal: ModalComponent
	modal_config: ModalConfig = new ModalConfig()

	constructor(
		private route: ActivatedRoute,
		private tracks_service: TracksService,
		public playlist_service: PlaylistsService,
		private user_service: UserService,
		private ua_service: UaService,
		private router: Router,
		private change_detector: ChangeDetectorRef,
		public setup_service: SetupService,
	) {}

	async ngOnInit() {
		this.route.params.subscribe(async params => {
			await this.setup_service.setup()
			this.playlist_service.current_playlist = params["name"] || ""
			this.playlist_service
				.get_tracks(
					this.user_service.current_user.user_id,
					this.playlist_service.current_playlist,
				)
				.subscribe(tracks => {
					this.playlist_service.tracks = tracks
				})
		})
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
					this.playlist_service.current_playlist,
					response.input,
				)
				.subscribe(names => {
					this.playlist_service.names = names
					this.router.navigateByUrl(`/page/playlist/${response.input}`)
				})
		}
	}

	async delete_playlist() {
		this.modal_config.modal_title = `Are you sure you want to delete playlist <span class="code">${this.playlist_service.current_playlist}</span>?`
		this.modal_config.show_dismiss_button = true
		this.modal_config.show_input = false
		this.modal.show()
		this.change_detector.detectChanges()
		let response = await this.modal.get_response()
		if (response.accepted) {
			this.playlist_service
				.delete_playlist(
					this.user_service.current_user.user_id,
					this.playlist_service.current_playlist,
				)
				.subscribe(names => {
					this.playlist_service.names = names
					this.router.navigateByUrl("/").then()
				})
		}
	}
}
