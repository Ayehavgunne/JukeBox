import {Component, Element, h, Host, Prop, State} from "@stencil/core"

@Component({
	tag: "modal-prompt",
	styleUrl: "modal-prompt.css",
})
export class ModalPrompt {
	@Element() el: HTMLModalPromptElement
	@Prop() header: string
	@Prop({mutable: true}) show_cancel? = false
	@Prop() show_input? = true
	@Prop() close: (string) => void
	@State() input = ""
	container: HTMLDivElement
	cancel_button: HTMLButtonElement

	componentWillLoad() {
		if (!this.show_input) {
			this.show_cancel = true
		}
	}

	componentDidRender() {
		setTimeout(() => {
			let input = this.el.querySelector("input")
			if (input) {
				input.focus()
			}
		}, 100)
	}

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
			return
		}
		if (!this.show_input) {
			await this.close("okay")
		}
	}

	cancel_handler = async (event: MouseEvent) => {
		let target = event.target as HTMLElement
		if (target === this.container || target === this.cancel_button) {
			if (this.show_cancel) {
				await this.close("")
				return
			}
			if (!this.show_input) {
				await this.close("cancel")
			}
		}
	}

	render() {
		return (
			<Host class="modal_host">
				<div class="modal_background" />
				<div
					class="modal_container"
					onClick={this.cancel_handler}
					ref={el => (this.container = el as HTMLDivElement)}
				>
					<div class="modal_box">
						<h3>{this.header}</h3>
						{this.show_input && (
							<input type="text" onChange={this.change_handler} />
						)}
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
