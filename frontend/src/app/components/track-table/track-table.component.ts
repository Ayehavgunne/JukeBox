import {Component, Input, OnInit, TemplateRef} from "@angular/core"
import {Track} from "../../models"
import {PlayerService} from "../../services/player.service"

@Component({
	selector: "track-table",
	templateUrl: "./track-table.component.html",
	styleUrls: ["./track-table.component.sass"],
})
export class TrackTableComponent implements OnInit {
	@Input() popup_menu: TemplateRef<any>
	@Input() tracks: Track[]
	@Input() show_headers: boolean

	constructor(public player_service: PlayerService) {}

	playing_event_handler() {
		this.player_service.set_queue(this.tracks)
	}

	ngOnInit(): void {}
}
