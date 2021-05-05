import {Component, OnInit} from "@angular/core"
import {SettingsService} from "../../services/settings.service"

@Component({
	selector: "settings",
	templateUrl: "./settings.component.html",
	styleUrls: ["./settings.component.sass"],
})
export class SettingsComponent implements OnInit {
	constructor(public settings_service: SettingsService) {}

	ngOnInit(): void {}
}
