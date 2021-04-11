import {Component, Host, h, Prop, Listen} from "@stencil/core"
import {Track} from "../../global/models"
import {get_player_controls} from "../../global/app"

@Component({
	tag: "play-container",
	styleUrl: "play-container.css",
	// shadow: true,
})
export class PlayContainer {
	@Prop() track: Track
	@Prop() click_handler: () => void

	@Listen("click")
	async play() {
		const controler = await get_player_controls()
		await controler.set_track(this.track)
		await controler.play()
		this.click_handler()
	}

	render() {
		return (
			<Host class="play_container_host">
				<slot />
			</Host>
		)
	}
}
