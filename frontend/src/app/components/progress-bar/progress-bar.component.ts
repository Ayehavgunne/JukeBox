import {Component, ElementRef, HostListener, OnInit, ViewChild} from "@angular/core"
import {PlayerService} from "../../services/player.service"
import {print} from "../../utils"

@Component({
	selector: "progress-bar",
	templateUrl: "./progress-bar.component.html",
	styleUrls: ["./progress-bar.component.sass"],
})
export class ProgressBarComponent implements OnInit {
	@ViewChild("bar") bar: ElementRef<HTMLDivElement>

	constructor(public player_service: PlayerService) {}

	ngOnInit(): void {}

	@HostListener("click", ["$event"])
	click_handler(event: MouseEvent) {
		print("clicked seek")
		this.player_service.seek_percent(
			(event.offsetX / this.bar.nativeElement.offsetWidth) * 100,
		)
	}
}
