import {Injectable} from "@angular/core"
import {PlaylistsService} from "./playlists.service"
import {UserService} from "./user.service"
import {UaService} from "./ua.service"
import {CookiesService} from "./cookies.service"
import {Router} from "@angular/router"
import {TracksService} from "./tracks.service"
import {ArtistsService} from "./artists.service"
import {AlbumsService} from "./albums.service"
import {print} from "../utils"

@Injectable({
	providedIn: "root",
})
export class SetupService {
	private setup_complete: boolean = false
	is_mobile: boolean = false

	constructor(
		public playlist_service: PlaylistsService,
		private albums_service: AlbumsService,
		private artists_service: ArtistsService,
		private tracks_service: TracksService,
		private user_service: UserService,
		private ua_service: UaService,
		private cookies_service: CookiesService,
		private router: Router,
	) {}

	async setup() {
		if (!this.setup_complete) {
			this.check_mobile()
			await this.check_current_user()
			this.tracks_service.get_loved_tracks().subscribe(tracks => {
				this.tracks_service.loved_tracks = tracks
			})
			this.artists_service.get_loved_artists().subscribe(artists => {
				this.artists_service.loved_artists = artists
			})
			this.albums_service.get_loved_albums().subscribe(albums => {
				this.albums_service.loved_albums = albums
			})
			this.check_playlist_names()
			this.setup_complete = true
		}
	}

	check_mobile() {
		this.is_mobile = this.ua_service.ua_parser.getDevice().type === "mobile"
	}

	async check_current_user() {
		if (this.user_service.current_user === undefined) {
			let user_id = Number(this.cookies_service.get("user_id") || 0)
			if (user_id === 0) {
				this.router.navigateByUrl("/login").then()
			}
			let user = await this.user_service.get_user_by_id(user_id).toPromise()
			this.user_service.set_current_user(user)
		}
	}

	check_playlist_names() {
		if (!this.playlist_service.names.length) {
			this.playlist_service
				.get_names(this.user_service.current_user.user_id)
				.subscribe(names => {
					this.playlist_service.names = names
				})
		}
	}
}
