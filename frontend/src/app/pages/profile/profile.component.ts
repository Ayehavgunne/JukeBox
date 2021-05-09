import {Component, OnInit} from "@angular/core"
import {PlaylistsService} from "../../services/playlists.service"
import {SetupService} from "../../services/setup.service"
import {ThemeService} from "../../services/theme.service"

@Component({
	selector: "profile",
	templateUrl: "./profile.component.html",
	styleUrls: ["./profile.component.sass"],
})
export class ProfileComponent implements OnInit {
	constructor(
		public theme_service: ThemeService,
		private playlist_service: PlaylistsService,
		private setup_service: SetupService,
	) {}

	async ngOnInit() {
		await this.setup_service.setup()
		this.playlist_service.current_playlist = ""
	}
}
