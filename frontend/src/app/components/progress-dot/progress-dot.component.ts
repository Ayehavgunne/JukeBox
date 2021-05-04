import {Component, HostListener, Input, OnInit} from "@angular/core"
import {PlayerService} from "../../services/player.service"

@Component({
	selector: "progress-dot",
	templateUrl: "./progress-dot.component.html",
	styleUrls: ["./progress-dot.component.sass"],
})
export class ProgressDotComponent implements OnInit {
	@Input() parent: HTMLDivElement
	progress: number
	active = false

	constructor(public player_service: PlayerService) {}

	ngOnInit(): void {
		this.progress = this.player_service.seek
	}

	@HostListener("touchstart")
	@HostListener("mousedown")
	async drag_start() {
		document.querySelector("body")!.classList.add("noselect")

		this.active = true
	}

	@HostListener("touchend")
	@HostListener("mouseup")
	async drag_end() {
		if (this.active) {
			document.querySelector("body")!.classList.remove("noselect")
			this.active = false
			this.player_service.seek_percent(this.progress)
		}
	}

	@HostListener("touchmove", ["$event"])
	@HostListener("mousemove", ["$event"])
	async drag(event: MouseEvent | TouchEvent) {
		if (this.active) {
			event.preventDefault()

			let parent_bounds = this.parent.getBoundingClientRect()
			let new_position, client_x
			switch (event.type) {
				case "touchmove":
					client_x = (event as TouchEvent).touches[0].clientX
					break
				case "mousemove":
					client_x = (event as MouseEvent).clientX
					break
				default:
					return
			}
			new_position =
				(parent_bounds.width - (parent_bounds.right - client_x)) /
				parent_bounds.width
			if (new_position >= 0 && new_position <= 1) {
				this.progress = new_position * 100
			}
		}
	}
}
