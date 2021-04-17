import {Component, Element, h, Host, Prop, State} from "@stencil/core"

@Component({
	tag: "modal-prompt",
	styleUrl: "modal-prompt.css",
})
export class ModalPrompt {
	@Element() el: HTMLModalPromptElement
	@Prop() header: string
	@Prop() show_cancel? = false
	@Prop() close: (string) => void
	@State() input = ""
	container: HTMLDivElement
	cancel_button: HTMLButtonElement

	change_handler = async (event: KeyboardEvent) => {
		event.preventDefault()
		event.stopPropagation()
		let target = event.target as HTMLInputElement
		this.input = target.value
	}

	okay_handler = async (event: MouseEvent) => {
		event.preventDefault()
		event.stopPropagation()
		if (this.input) {
			await this.close(this.input)
		}
	}

	cancel_handler = async (event: MouseEvent) => {
		let target = event.target as HTMLElement
		if (
			this.show_cancel &&
			(target === this.container || target === this.cancel_button)
		) {
			await this.close("")
		}
	}

	render() {
		return (
			<Host class="modal_host">
				<div class="background" />
				<div
					class="modal_container"
					onClick={this.cancel_handler}
					ref={el => (this.container = el as HTMLDivElement)}
				>
					<div class="modal_box">
						<h3>{this.header}</h3>
						<input type="text" onChange={this.change_handler} />
						<div>
							<button onClick={this.okay_handler}>Okay</button>
							{this.show_cancel && (
								<button
									ref={el =>
										(this.cancel_button = el as HTMLButtonElement)
									}
								>
									Cancel
								</button>
							)}
						</div>
					</div>
				</div>
			</Host>
		)
	}
}
