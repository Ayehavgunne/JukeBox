import {Component, OnInit, ViewChild} from "@angular/core"
import {ActivatedRoute} from "@angular/router"
import {ModalConfig, Track} from "../../models"
import {TracksService} from "../../services/tracks.service"
import {PlaylistsService} from "../../services/playlists.service"
import {ModalComponent} from "../../components/modal/modal.component"
import {PopupMenuComponent} from "../../components/popup-menu/popup-menu.component"
import {SetupService} from "../../services/setup.service"

@Component({
	selector: "tracks",
	templateUrl: "./tracks.component.html",
	styleUrls: ["./tracks.component.sass"],
})
export class TracksComponent implements OnInit {
	@ViewChild("modal") modal: ModalComponent
	@ViewChild("popup_menu") popup_menu: PopupMenuComponent
	tracks: Track[]
	playlists: string[] = []
	modal_config: ModalConfig = new ModalConfig()

	constructor(
		private route: ActivatedRoute,
		private tracks_service: TracksService,
		private playlist_service: PlaylistsService,
		public setup_service: SetupService,
	) {}

	async ngOnInit() {
		await this.setup_service.setup()
		this.playlist_service.current_playlist = ""
		this.route.params.subscribe(params => {
			let album_id = Number(params["album"] || 0)
			if (album_id) {
				this.tracks_service.get_tracks(album_id).subscribe(tracks => {
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
