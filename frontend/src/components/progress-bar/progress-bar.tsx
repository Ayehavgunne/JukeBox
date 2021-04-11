import {Component, Element, h, Host, Listen, Prop} from "@stencil/core"

@Component({
	tag: "progress-bar",
	styleUrl: "progress-bar.css",
	// shadow: true,
})
export class ProgressBar {
	@Element() el: HTMLProgressBarElement
	@Prop() progress: number
	@Prop() seek_handler: (number) => void
	progress_bar: HTMLDivElement
	progress_dot: HTMLProgressDotElement

	@Listen("click")
	async click_handler(event: MouseEvent) {
		let target = event.target as HTMLElement
		if (target !== this.progress_dot && !this.progress_dot.contains(target)) {
			let click_position = (event.offsetX / this.el.offsetWidth) * 100
			this.seek_handler(click_position)
		}
	}

	render() {
		return (
			<Host class="progress_bar_host">
				<div
					id="progress_bar"
					ref={el => (this.progress_bar = el as HTMLDivElement)}
				>
					<progress-dot
						progress={this.progress}
						parent={this.progress_bar}
						seek_handler={this.seek_handler}
						ref={el => (this.progress_dot = el as HTMLProgressDotElement)}
					/>
				</div>
			</Host>
		)
	}
}
