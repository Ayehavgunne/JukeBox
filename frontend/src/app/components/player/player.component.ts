import {Component, OnInit, ViewChild} from "@angular/core"
// import {CookiesService} from "../../services/cookies.service"
import {PlayerService} from "../../services/player.service"
import {ua_parser} from "../../utils"

@Component({
	selector: "player",
	templateUrl: "./player.component.html",
	styleUrls: ["./player.component.sass"],
	// providers: [CookiesService],
})
export class PlayerComponent implements OnInit {
	@ViewChild("bar") bar: HTMLDivElement
	os_show_volume: boolean = true
	show_volume_bar: boolean = false
	volume: number = this.player_service.volume

	constructor(public player_service: PlayerService) {}

	ngOnInit(): void {
		let os_name = ua_parser.getOS().name
		let device_type = ua_parser.getDevice().type
		this.os_show_volume =
			os_name !== "iOS" && device_type !== "mobile" && device_type !== "tablet"
	}

	toggle_volume_showing = () => {
		this.show_volume_bar = !this.show_volume_bar
	}
}
