import {Component, OnInit} from "@angular/core"
import {ActivatedRoute} from "@angular/router"
import {Album, Artist} from "../../models"
import {PlaylistsService} from "../../services/playlists.service"
import {ArtistsService} from "../../services/artists.service"
import {AlbumsService} from "../../services/albums.service"
import {SetupService} from "../../services/setup.service"

@Component({
	selector: "albums",
	templateUrl: "./albums.component.html",
	styleUrls: ["./albums.component.sass"],
})
export class AlbumsComponent implements OnInit {
	selected_artist: Artist
	albums: Album[]

	constructor(
		private route: ActivatedRoute,
		private album_service: AlbumsService,
		private artist_service: ArtistsService,
		private playlist_service: PlaylistsService,
		private setup_service: SetupService,
	) {}

	async ngOnInit() {
		await this.setup_service.setup()
		this.playlist_service.current_playlist = ""
		this.route.params.subscribe(params => {
			let artist_id = Number(params["artist"] || 0)
			if (artist_id) {
				this.artist_service.get_artist(artist_id).subscribe(artist => {
					this.selected_artist = artist
				})
				this.album_service.get_albums(artist_id).subscribe(albums => {
					this.albums = albums
				})
			} else {
				this.album_service.get_albums().subscribe(albums => {
					this.albums = albums
				})
			}
		})
	}
}
