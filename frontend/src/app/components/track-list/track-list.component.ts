import {Component, Input, OnInit, TemplateRef} from "@angular/core"
import {Track} from "../../models"
import {PlayerService} from "../../services/player.service"
import {print} from "../../utils"

@Component({
	selector: "track-list",
	templateUrl: "./track-list.component.html",
	styleUrls: ["./track-list.component.sass"],
})
export class TrackListComponent implements OnInit {
	@Input() popup_menu: TemplateRef<any>
	@Input() tracks: Track[]

	constructor(public player_service: PlayerService) {}

	playing_event_handler() {
		this.player_service.set_queue(this.tracks)
	}

	ngOnInit(): void {}
}
