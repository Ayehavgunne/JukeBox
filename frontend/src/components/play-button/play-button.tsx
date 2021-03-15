import {Component, h, Host, Listen, Prop} from "@stencil/core"

@Component({
	tag: "play-button",
	styleUrl: "play-button.css",
	shadow: true,
})
export class PlayButton {
	@Prop() paused: boolean = true
	@Prop() toggle_playing: () => void

	@Listen("click")
	async toggle_playing_handler() {
		this.toggle_playing()
	}

	render() {
		return (
			<Host>
				{this.paused ? (
					<div class="play_button" />
				) : (
					<div class="play_button paused" />
				)}
			</Host>
		)
	}
}
