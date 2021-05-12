import {Component, OnInit} from "@angular/core"
import {SettingsService} from "../../services/settings.service"
import {PlaylistsService} from "../../services/playlists.service"
import {SetupService} from "../../services/setup.service"

@Component({
	selector: "settings",
	templateUrl: "./settings.component.html",
	styleUrls: ["./settings.component.sass"],
})
export class SettingsComponent implements OnInit {
	constructor(
		public settings_service: SettingsService,
		private playlist_service: PlaylistsService,
		private setup_service: SetupService,
	) {}

	async ngOnInit() {
		await this.setup_service.setup()
		this.playlist_service.current_playlist = ""
	}
}
