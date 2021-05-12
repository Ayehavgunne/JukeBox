import {Component, OnInit} from "@angular/core"
import {PlayerService} from "../../services/player.service"

@Component({
	selector: "progress-dot",
	templateUrl: "./progress-dot.component.html",
	styleUrls: ["./progress-dot.component.sass"],
})
export class ProgressDotComponent implements OnInit {
	constructor(public player_service: PlayerService) {}

	ngOnInit(): void {}
}
