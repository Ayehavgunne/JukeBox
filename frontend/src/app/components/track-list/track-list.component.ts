import {Component, Input, OnInit} from "@angular/core"
import {Track} from "../../models"
import {PlayerService} from "../../services/player.service"
import {BaseSortable, sort_mixin} from "../../utils"

@Component({
	selector: "track-list",
	templateUrl: "./track-list.component.html",
	styleUrls: ["./track-list.component.sass"],
})
export class TrackListComponent extends sort_mixin(BaseSortable) implements OnInit {
	@Input() tracks: Track[]
	@Input() in_playlist?: boolean
	@Input() viewing_queue?: boolean

	constructor(public player_service: PlayerService) {
		super()
	}

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
