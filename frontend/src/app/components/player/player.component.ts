import {Component, OnInit} from "@angular/core"
import {PlayerService} from "../../services/player.service"
import {UaService} from "../../services/ua.service"

@Component({
	selector: "player",
	templateUrl: "./player.component.html",
	styleUrls: ["./player.component.sass"],
})
export class PlayerComponent implements OnInit {
	os_show_volume: boolean = true
	show_volume_bar: boolean = false
	volume: number = this.player_service.volume

	constructor(public player_service: PlayerService, private ua_service: UaService) {}

	ngOnInit(): void {
		let os_name = this.ua_service.ua_parser.getOS().name
		let device_type = this.ua_service.ua_parser.getDevice().type
		this.os_show_volume =
			os_name !== "iOS" && device_type !== "mobile" && device_type !== "tablet"
	}

	toggle_volume_showing = () => {
		this.show_volume_bar = !this.show_volume_bar
	}
}
