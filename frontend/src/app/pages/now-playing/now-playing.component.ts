import {Component, OnInit, ViewChild} from "@angular/core"
import {ModalComponent} from "../../components/modal/modal.component"
import {PopupMenuComponent} from "../../components/popup-menu/popup-menu.component"
import {ModalConfig} from "../../models"
import {PlaylistsService} from "../../services/playlists.service"
import {PlayerService} from "../../services/player.service"
import {SetupService} from "../../services/setup.service"
import {print} from "../../utils"

@Component({
	selector: "now-playing",
	templateUrl: "./now-playing.component.html",
	styleUrls: ["./now-playing.component.sass"],
})
export class NowPlayingComponent implements OnInit {
	@ViewChild("modal") modal: ModalComponent
	@ViewChild("popup_menu") popup_menu: PopupMenuComponent
	modal_config: ModalConfig = new ModalConfig()

	constructor(
		public player_service: PlayerService,
		private playlist_service: PlaylistsService,
		public setup_service: SetupService,
	) {}

	async ngOnInit() {
		await this.setup_service.setup()
		this.playlist_service.current_playlist = ""
	}
}
