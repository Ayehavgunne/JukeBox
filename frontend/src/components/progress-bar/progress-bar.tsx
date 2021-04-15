import {Component, Element, h, Host, Listen, Prop} from "@stencil/core"

@Component({
	tag: "progress-bar",
	styleUrl: "progress-bar.css",
})
export class ProgressBar {
	@Element() el: HTMLProgressBarElement
	@Prop() progress: number
	@Prop() current_time: number
	@Prop() total_time: number
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
		let current_time = ""
		if (this.current_time) {
			current_time = new Date(this.current_time * 1000)
				.toISOString()
				.substr(14, 5)
		}
		let total_time = ""
		if (this.total_time) {
			total_time = new Date(this.total_time * 1000).toISOString().substr(14, 5)
		}
		return (
			<Host class="progress_bar_host">
				<div class="current_time">{current_time}</div>
				<div class="total_time">{total_time}</div>
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
