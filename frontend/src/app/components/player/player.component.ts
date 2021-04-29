import {Component, OnInit} from "@angular/core"
import {CookiesService} from "../../services/cookies.service"
import {PlayerService} from "../../services/player.service"
import {ua_parser} from "../../utils"

@Component({
	selector: "player",
	templateUrl: "./player.component.html",
	styleUrls: ["./player.component.sass"],
	providers: [CookiesService],
})
export class PlayerComponent implements OnInit {
	os_hide_volume: boolean
	volume_bar_hidden = true
	volume: number = this.player_service.vol

	constructor(public player_service: PlayerService) {}

	ngOnInit(): void {
		let os_name = ua_parser.getOS().name
		let device_type = ua_parser.getDevice().type
		this.os_hide_volume =
			os_name !== "iOS" && device_type !== "mobile" && device_type !== "tablet"
	}

	// get_volume = (): number => {
	// 	return this.player_service.vol
	// }

	toggle_volume_showing = () => {
		this.volume_bar_hidden = !this.volume_bar_hidden
	}
}
