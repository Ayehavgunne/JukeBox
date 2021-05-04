import {Component, OnInit} from "@angular/core"
import {ActivatedRoute} from "@angular/router"
import {Artist, Track} from "../../models"
import {ArtistsService} from "../../services/artists.service"
import {print} from "../../utils"

@Component({
	selector: "artists",
	templateUrl: "./artists.component.html",
	styleUrls: ["./artists.component.sass"],
})
export class ArtistsComponent implements OnInit {
	artists: Array<Artist>
	tracks: Array<Track>
	artist: Artist
	track: Track

	constructor(
		private route: ActivatedRoute,
		private artist_service: ArtistsService,
	) {}

	ngOnInit(): void {
		this.route.params.subscribe(params => {
			let artist_id = Number(params["artist"] || 0)
			if (artist_id) {
				this.artist_service.get_tracks(artist_id).subscribe(tracks => {
					this.tracks = tracks
				})
				this.artist_service.get_artist(artist_id).subscribe(artist => {
					this.artist = artist
				})
			} else {
				this.artist_service.get_artists().subscribe(artists => {
					this.artists = artists
				})
			}
		})
	}
}
