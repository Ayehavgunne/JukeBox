import {Component, Injectable, Input, OnInit} from "@angular/core"
import {ModalConfig} from "../../models"

@Component({
	selector: "modal",
	templateUrl: "./modal.component.html",
	styleUrls: ["./modal.component.sass"],
})
@Injectable()
export class ModalComponent implements OnInit {
	private showing: boolean = false
	private response: string = ""
	@Input() public modalConfig: ModalConfig = {}

	constructor() {}

	ngOnInit(): void {}

	show() {
		this.showing = true
	}

	finish() {
		return new Promise(function (resolve, reject) {})
	}

	cancel() {}

	async get_response() {
		return this.response
	}
}
