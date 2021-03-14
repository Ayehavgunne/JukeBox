import {Component, Element, h, Host, Prop, Watch} from "@stencil/core"

@Component({
	tag: "progress-bar",
	styleUrl: "progress-bar.css",
	shadow: true,
})
export class ProgressBar {
	@Element() el: HTMLElement
	@Prop() progress: number

	@Watch("progress")
	async progress_handler() {
		let dot: HTMLDivElement = this.el.shadowRoot.querySelector("#progress_dot")
		dot.style.left = this.progress.toFixed(2) + "%"
	}

	render() {
		return (
			<Host>
				<div id="progress_dot" />
				<div id="progress_bar" />
			</Host>
		)
	}
}
