import {Component, OnInit} from "@angular/core"
import {PlaylistsService} from "../../services/playlists.service"
import {SetupService} from "../../services/setup.service"
import {ThemeService} from "../../services/theme.service"
import {UserService} from "../../services/user.service"

@Component({
	selector: "profile",
	templateUrl: "./profile.component.html",
	styleUrls: ["./profile.component.sass"],
})
export class ProfileComponent implements OnInit {
	primary_color: string = "#15dea5"

	constructor(
		public theme_service: ThemeService,
		private playlist_service: PlaylistsService,
		private setup_service: SetupService,
		private user_service: UserService,
	) {}

	async ngOnInit() {
		await this.setup_service.setup()
		this.playlist_service.current_playlist = ""
		this.primary_color = this.theme_service.get_property("--primary")
	}

	change_color_handler(color: string) {
		this.theme_service.set_property("--primary", color)
	}

	select_color_handler(color: string) {
		this.theme_service.set_property("--primary", color)
		this.user_service.current_user.settings.primary_color = color
		this.user_service.update_user_settings(this.user_service.current_user)
	}
}
