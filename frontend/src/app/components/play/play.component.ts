import {Component, HostListener, Input, OnInit} from "@angular/core"
import {Track} from "../../models"
import {PlayerService} from "../../services/player.service"
import {print} from "../../utils"

@Component({
	selector: "play",
	templateUrl: "./play.component.html",
	styleUrls: ["./play.component.sass"],
})
export class PlayComponent implements OnInit {
	@Input() track?: Track

	constructor(private player_service: PlayerService) {}

	ngOnInit(): void {}

	@HostListener("click")
	play() {
		if (this.track) {
			this.player_service.set_track(this.track)
			this.player_service.play()
		} else {
			this.player_service.toggle_playing()
		}
	}
}
