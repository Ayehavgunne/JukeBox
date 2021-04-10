import {Component, Element, h, Host, Prop} from "@stencil/core"

@Component({
	tag: "progress-bar",
	styleUrl: "progress-bar.css",
	shadow: true,
})
export class ProgressBar {
	@Element() el: HTMLProgressBarElement
	@Prop() progress: number
	@Prop() seek_handler: (number) => void
	bar_div: HTMLDivElement

	render() {
		return (
			<Host>
				<div
					id="progress_bar"
					ref={el => (this.bar_div = el as HTMLDivElement)}
				>
					<progress-dot
						progress={this.progress}
						parent={this.bar_div}
						seek_handler={this.seek_handler}
					/>
				</div>
			</Host>
		)
	}
}
