import {Component, OnInit, ViewChild} from "@angular/core"
import {PlaylistsService} from "../../services/playlists.service"
import {ModalComponent} from "../../components/modal/modal.component"
import {ModalConfig} from "../../models"
import {SetupService} from "../../services/setup.service"

@Component({
	selector: "home",
	templateUrl: "./home.component.html",
	styleUrls: ["./home.component.sass"],
})
export class HomeComponent implements OnInit {
	@ViewChild("modal") modal: ModalComponent
	modal_config: ModalConfig = new ModalConfig()

	constructor(
		private playlist_service: PlaylistsService,
		private setup_service: SetupService,
	) {}

	async ngOnInit() {
		await this.setup_service.setup()
		this.playlist_service.current_playlist = ""
	}
}
