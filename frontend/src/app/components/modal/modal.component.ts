import {
	Component,
	ElementRef,
	HostListener,
	Injectable,
	Input,
	OnInit,
	ViewChild,
} from "@angular/core"
import {ModalConfig, ModalResponse} from "../../models"
import {print} from "../../utils"

@Component({
	selector: "modal",
	templateUrl: "./modal.component.html",
	styleUrls: ["./modal.component.sass"],
})
@Injectable()
export class ModalComponent implements OnInit {
	@Input() public modal_config: ModalConfig
	@ViewChild("input") input: ElementRef<HTMLInputElement>
	showing: boolean = false
	private response: string = ""
	private accepted: boolean = false
	private _resolve: (result?: any) => void

	constructor() {}

	ngOnInit(): void {}

	show = (): void => {
		this.showing = true
		if (this.modal_config.show_input) {
			setTimeout(() => {
				this.input.nativeElement.focus()
			}, 200)
		}
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

	@HostListener("keyup", ["$event"])
	key_up(event: KeyboardEvent) {
		if (event.code === "Enter" || event.code === "NumpadEnter") {
			this.okay()
		}
	}

	async get_response(): Promise<ModalResponse> {
		return new Promise<ModalResponse>(resolve => {
			this._resolve = resolve
		})
	}
}
