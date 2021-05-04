import {
	Component,
	EventEmitter,
	HostListener,
	Input,
	OnInit,
	Output,
} from "@angular/core"
import {Track} from "../../models"
import {PlayerService} from "../../services/player.service"

@Component({
	selector: "play",
	templateUrl: "./play.component.html",
	styleUrls: ["./play.component.sass"],
})
export class PlayComponent implements OnInit {
	@Input() track?: Track
	@Output() play_track_event: EventEmitter<void> = new EventEmitter<void>()

	constructor(private player_service: PlayerService) {}

	ngOnInit(): void {}

	@HostListener("click")
	play() {
		this.play_track_event.emit()
		if (this.track) {
			this.player_service.play(this.track)
		} else {
			this.player_service.toggle_playing()
		}
	}
}
