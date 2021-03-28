import {Component, Element, h, Host, Prop} from "@stencil/core"

@Component({
	tag: "progress-bar",
	styleUrl: "progress-bar.css",
	shadow: true,
})
export class ProgressBar {
	@Element() el: HTMLProgressBarElement
	@Prop() progress: number

	render() {
		return (
			<Host>
				<progress-dot progress={this.progress} />
				<div id="progress_bar" />
			</Host>
		)
	}
}
