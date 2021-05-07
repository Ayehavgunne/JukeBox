import {Component, OnInit, ViewChild} from "@angular/core"
import {PlaylistsService} from "../../services/playlists.service"
import {ModalComponent} from "../../components/modal/modal.component"
import {ModalConfig} from "../../models"

@Component({
	selector: "home",
	templateUrl: "./home.component.html",
	styleUrls: ["./home.component.sass"],
})
export class HomeComponent implements OnInit {
	@ViewChild("modal") modal: ModalComponent
	modal_config: ModalConfig = new ModalConfig()

	constructor(public playlist_service: PlaylistsService) {}

	ngOnInit() {}
}
