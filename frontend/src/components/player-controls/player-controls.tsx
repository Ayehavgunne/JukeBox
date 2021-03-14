import {Component, h, Listen, Method, Prop, State} from "@stencil/core"

@Component({
	tag: "player-controls",
	styleUrl: "player-controls.css",
	shadow: true,
})
export class PlayerControls {
	@State() paused: boolean = true
	@Prop() audio = new Audio()

	@Method()
	async play() {
		let outcome = await this.audio.play()
		if (outcome === undefined) {
			// Automatic playback failed.
			// Show a UI element to let the user manually start playback.
		}
		this.paused = false
	}

	@Method()
	async pause() {
		this.audio.pause()
		this.paused = true
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
					<div class="play_button pause" />
				)}
				{/*<progress-bar />*/}
			</div>
		)
	}
}
