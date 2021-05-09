import {Component, Input, OnInit} from "@angular/core"
import {Track} from "../../models"
import {PlayerService} from "../../services/player.service"
import {print} from "../../utils"

@Component({
	selector: "track-table",
	templateUrl: "./track-table.component.html",
	styleUrls: ["./track-table.component.sass"],
})
export class TrackTableComponent implements OnInit {
	@Input() tracks: Track[]
	@Input() show_headers: boolean
	@Input() in_playlist?: boolean
	@Input() viewing_queue?: boolean

	constructor(public player_service: PlayerService) {}

	ngOnInit(): void {
		if (this.in_playlist === undefined) {
			this.in_playlist = false
		}
		if (this.viewing_queue === undefined) {
			this.viewing_queue = false
		}
	}

	playing_event_handler() {
		this.player_service.set_queue(this.tracks)
	}
}
