import {Component, Element, h, Listen, Method, Prop, State} from "@stencil/core"
import {Components} from "../../components"
import ProgressBar = Components.ProgressBar

@Component({
	tag: "player-controls",
	styleUrl: "player-controls.css",
	shadow: true,
})
export class PlayerControls {
	@Element() el: HTMLDivElement
	@State() paused: boolean = true
	@Prop() audio: HTMLAudioElement = new Audio()
	progress_interval: number
	progress: number

	@Method()
	async play() {
		let outcome = await this.audio.play()
		if (outcome === undefined) {
			// Automatic playback failed.
			// Show a UI element to let the user manually start playback.
		}
		this.paused = false
		this.progress_interval = setInterval(() => {
			let duration = this.audio.duration
			let current_time = this.audio.currentTime
			let progress = (current_time / duration) * 100
			let progres_bar: ProgressBar = this.el.shadowRoot.querySelector(
				"progress-bar",
			)
			progres_bar.progress = progress
			this.progress = progress
		}, 50)
	}

	@Method()
	async pause() {
		this.audio.pause()
		this.paused = true
		clearInterval(this.progress_interval)
	}

	@Method()
	async set_track(track_number: number) {
		this.audio.src = "/play/" + track_number
	}

	@Listen("click")
	async toggle() {
		if (this.paused) {
			await this.play()
		} else {
			await this.pause()
		}
	}

	render() {
		return (
			<div>
				{this.paused ? (
					<div class="play_button" />
				) : (
					<div class="play_button paused" />
				)}
				<progress-bar />
			</div>
		)
	}
}
