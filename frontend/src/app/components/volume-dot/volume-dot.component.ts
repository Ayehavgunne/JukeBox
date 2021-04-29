import {Component, HostListener, Input, OnInit} from "@angular/core"
import {PlayerService} from "../../services/player.service"

@Component({
	selector: "volume-dot",
	templateUrl: "./volume-dot.component.html",
	styleUrls: ["./volume-dot.component.sass"],
})
export class VolumeDotComponent implements OnInit {
	@Input() parent: HTMLDivElement
	volume: number = 0.6
	active = false

	constructor(private player_service: PlayerService) {}

	ngOnInit(): void {
		this.volume = this.player_service.volume
	}

	@HostListener("touchstart")
	@HostListener("mousedown")
	async drag_start() {
		document.querySelector("body")!.classList.add("noselect")
		document.documentElement.style.overflow = "hidden"

		this.active = true
	}

	@HostListener("touchend")
	@HostListener("mouseup")
	async drag_end() {
		document.querySelector("body")!.classList.remove("noselect")
		document.documentElement.style.overflow = "auto"
		this.active = false
	}

	@HostListener("touchmove", ["$event"])
	@HostListener("mousemove", ["$event"])
	async drag(event: MouseEvent | TouchEvent) {
		if (this.active) {
			event.preventDefault()
			let parent_bounds = this.parent.getBoundingClientRect()
			let new_volume, client_y
			switch (event.type) {
				case "touchmove":
					client_y = (event as TouchEvent).touches[0].clientY
					break
				case "mousemove":
					client_y = (event as MouseEvent).clientY
					break
				default:
					return
			}
			new_volume =
				(parent_bounds.height - (client_y - parent_bounds.top)) /
				parent_bounds.height
			if (new_volume >= 0 && new_volume <= 1) {
				this.player_service.volume = new_volume
				this.volume = new_volume
			}
		}
	}
}
