import {Component, OnInit} from "@angular/core"
import {ActivatedRoute, Router} from "@angular/router"
import {Album, Artist} from "../../models"
import {PlaylistsService} from "../../services/playlists.service"
import {ArtistsService} from "../../services/artists.service"
import {AlbumsService} from "../../services/albums.service"
import {print} from "../../utils"
import {UserService} from "../../services/user.service"
import {UaService} from "../../services/ua.service"
import {CookiesService} from "../../services/cookies.service"

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
		public playlist_service: PlaylistsService,
		private user_service: UserService,
		private ua_service: UaService,
		private cookies_service: CookiesService,
		private router: Router,
	) {}

	async ngOnInit() {
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
