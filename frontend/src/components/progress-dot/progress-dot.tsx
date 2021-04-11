import {Component, Element, h, Host, Listen, Prop, Watch} from "@stencil/core"

@Component({
	tag: "progress-dot",
	styleUrl: "progress-dot.css",
	// shadow: true,
})
export class ProgressDot {
	@Element() el: HTMLProgressDotElement
	@Prop({mutable: true}) progress: number
	@Prop() parent: HTMLDivElement
	@Prop() seek_handler: (number) => void
	mew_position: number
	active = false
	progress_dot: HTMLDivElement

	@Listen("touchstart")
	@Listen("mousedown")
	async drag_start(event) {
		document.querySelector("body").classList.add("noselect")

		if (event.target === this.el || event.target === this.progress_dot) {
			this.active = true
		}
	}

	@Listen("touchend", {target: "body"})
	@Listen("mouseup", {target: "body"})
	async drag_end() {
		if (this.active) {
			document.querySelector("body").classList.remove("noselect")
			this.active = false
			this.seek_handler(this.mew_position)
		}
	}

	@Listen("touchmove", {target: "body"})
	@Listen("mousemove", {target: "body"})
	async drag(event) {
		if (this.active) {
			event.preventDefault()

			let parent_bounds = this.parent.getBoundingClientRect()
			let new_position, client_x
			if (event.type === "touchmove") {
				client_x = event.touches[0].clientX
			} else {
				client_x = event.clientX
			}
			new_position =
				(parent_bounds.width - (parent_bounds.right - client_x)) /
				parent_bounds.width
			if (new_position >= 0 && new_position <= 1) {
				this.mew_position = new_position * 100
				this.el.style.left = this.mew_position.toFixed(2) + "%"
			}
		}
	}

	@Watch("progress")
	async position_handler() {
		if (!this.active) {
			this.el.style.left = this.progress.toFixed(2) + "%"
		}
	}

	render() {
		return (
			<Host class="progress_dot_host">
				<div
					class="progress_dot"
					ref={el => (this.progress_dot = el as HTMLDivElement)}
				/>
			</Host>
		)
	}
}
