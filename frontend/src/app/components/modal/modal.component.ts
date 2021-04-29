import {Component, Injectable, Input, OnInit} from "@angular/core"
import {ModalConfig, ModalResponse} from "../../models"

@Component({
	selector: "modal",
	templateUrl: "./modal.component.html",
	styleUrls: ["./modal.component.sass"],
})
@Injectable()
export class ModalComponent implements OnInit {
	@Input() public modal_config: ModalConfig
	showing: boolean = false
	private response: string = ""
	private accepted: boolean = false
	private _resolve: (result?: any) => void
	private _reject: (reason?: any) => void

	constructor() {}

	ngOnInit(): void {}

	show = (): void => {
		this.showing = true
	}

	okay() {
		this.accepted = true
		this.modal_config.on_accept()
		let modual_response = new ModalResponse(this.accepted, this.response)
		this._resolve(modual_response)
		this.showing = false
	}

	cancel() {
		this.accepted = false
		this.modal_config.on_dismiss()
		let modual_response = new ModalResponse(this.accepted, this.response)
		this._resolve(modual_response)
		this.showing = false
	}

	input_change(target: EventTarget | null) {
		if (target) {
			let new_value = (target as HTMLInputElement).value
			this.modal_config.on_input_change(new_value)
			this.response = new_value
		}
	}

	async get_response(): Promise<ModalResponse> {
		return new Promise<ModalResponse>((resolve, reject) => {
			this._resolve = resolve
			this._reject = reject
		})
	}
}
