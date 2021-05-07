import {OnInit, Component} from "@angular/core"
import {ModalConfig} from "./models"
import {PlaylistsService} from "./services/playlists.service"
import {MenuToggleService} from "./services/menu-toggle.service"
import {print} from "./utils"

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.sass"],
})
export class AppComponent implements OnInit {
	title = "Jukebox"
	modal_config: ModalConfig = new ModalConfig()

	constructor(
		public playlist_service: PlaylistsService,
		public menu_toggle_service: MenuToggleService,
	) {}

	async ngOnInit() {}
}
