import {Component, HostListener, OnInit, ViewChild} from "@angular/core"
import {PlayerService} from "../../services/player.service"

@Component({
	selector: "progress-bar",
	templateUrl: "./progress-bar.component.html",
	styleUrls: ["./progress-bar.component.sass"],
})
export class ProgressBarComponent implements OnInit {
	@ViewChild("bar") bar: HTMLDivElement
	current_time: string
	total_time: string

	constructor(private player_service: PlayerService) {}

	ngOnInit(): void {
		if (this.player_service.seek) {
			this.current_time = new Date(this.player_service.seek * 1000)
				.toISOString()
				.substr(14, 5)
		}
		if (this.total_time) {
			this.total_time = new Date(this.player_service.total_time * 1000)
				.toISOString()
				.substr(14, 5)
		}
	}

	@HostListener("click", ["$event"])
	click_handler(event: MouseEvent) {
		this.player_service.seek = (event.offsetX / this.bar.offsetWidth) * 100
	}
}
