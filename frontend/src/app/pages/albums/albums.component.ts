import {ChangeDetectorRef, Component, OnInit, ViewChild} from "@angular/core"
import {ActivatedRoute} from "@angular/router"
import {Album, Artist, ModalConfig} from "../../models"
import {CookiesService} from "../../services/cookies.service"
import {PlaylistsService} from "../../services/playlists.service"
import {UserService} from "../../services/user.service"
import {ModalComponent} from "../../components/modal/modal.component"
import {PopupMenuComponent} from "../../components/popup-menu/popup-menu.component"
import {ArtistsService} from "../../services/artists.service"
import {AlbumsService} from "../../services/albums.service"
import {print} from "../../utils"

@Component({
	selector: "albums",
	templateUrl: "./albums.component.html",
	styleUrls: ["./albums.component.sass"],
})
export class AlbumsComponent implements OnInit {
	@ViewChild("modal") modal: ModalComponent
	@ViewChild("popup_menu") popup_menu: PopupMenuComponent
	modal_config: ModalConfig = new ModalConfig()
	selected_artist: Artist
	albums: Album[]

	constructor(
		private route: ActivatedRoute,
		private album_service: AlbumsService,
		private artist_service: ArtistsService,
		private cookies_service: CookiesService,
		public playlist_service: PlaylistsService,
		private user_service: UserService,
		private change_detector: ChangeDetectorRef,
	) {}

	async ngOnInit() {
		if (this.user_service.current_user === undefined) {
			await this.user_service.set_current_user(
				this.cookies_service,
				this.playlist_service,
				this.modal,
				this.modal_config,
				this.change_detector,
			)
		}
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
