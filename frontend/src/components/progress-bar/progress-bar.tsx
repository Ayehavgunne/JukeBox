import {Component, h} from "@stencil/core"

@Component({
	tag: "progress-bar",
	styleUrl: "progress-bar.css",
	shadow: true,
})
export class ProgressBar {
	render() {
		return (
			<div id="progress">
				<div id="progress_dot" />
				<div id="progress_bar" />
			</div>
		)
	}
}
