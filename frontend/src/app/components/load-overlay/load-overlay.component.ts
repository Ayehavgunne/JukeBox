import {Component, OnInit} from "@angular/core"
import {SpinnerService} from "../../services/spinner.service"

@Component({
	selector: "load-overlay",
	templateUrl: "./load-overlay.component.html",
	styleUrls: ["./load-overlay.component.sass"],
})
export class LoadOverlayComponent implements OnInit {
	constructor(public spinner_service: SpinnerService) {}

	ngOnInit(): void {}
}
