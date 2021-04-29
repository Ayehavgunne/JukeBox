import {Component, HostListener, OnInit} from "@angular/core"
import {print} from "../../utils"

@Component({
	selector: "play",
	templateUrl: "./play.component.html",
	styleUrls: ["./play.component.sass"],
})
export class PlayComponent implements OnInit {
	constructor() {}

	ngOnInit(): void {}

	@HostListener("click", ["$event.target"])
	play(target: EventTarget) {
		print("play!", target)
	}
}
