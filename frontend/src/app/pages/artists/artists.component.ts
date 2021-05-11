import {Component, OnInit, ViewChild} from "@angular/core"
import {ActivatedRoute} from "@angular/router"
import {Artist, ModalConfig, Track} from "../../models"
import {ArtistsService} from "../../services/artists.service"
import {ModalComponent} from "../../components/modal/modal.component"
import {PlaylistsService} from "../../services/playlists.service"
import {SetupService} from "../../services/setup.service"

@Component({
	selector: "artists",
	templateUrl: "./artists.component.html",
	styleUrls: ["./artists.component.sass"],
})
export class ArtistsComponent implements OnInit {
	@ViewChild("modal") modal: ModalComponent
	modal_config: ModalConfig = new ModalConfig()
	artists: Array<Artist>
	tracks: Array<Track>
	selected_artist: Artist
	track: Track

	constructor(
		private route: ActivatedRoute,
		private artist_service: ArtistsService,
		private playlist_service: PlaylistsService,
		public setup_service: SetupService,
	) {}

	async ngOnInit() {
		await this.setup_service.setup()
		this.playlist_service.current_playlist = ""
		this.route.params.subscribe(params => {
			let artist_id = Number(params["artist"] || 0)
			if (artist_id) {
				this.artist_service.get_tracks(artist_id).subscribe(tracks => {
					this.tracks = tracks
				})
				this.artist_service.get_artist(artist_id).subscribe(artist => {
					this.selected_artist = artist
				})
			} else {
				this.artist_service.get_artists().subscribe(artists => {
					this.artists = artists
				})
			}
		})
	}
}
