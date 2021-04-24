import {Component, Host, h, Prop, Listen} from "@stencil/core"
import {Track} from "../../global/models"
import {get_player_controls} from "../../global/app"

@Component({
	tag: "play-container",
	styleUrl: "play-container.css",
})
export class PlayContainer {
	@Prop() track: Track
	@Prop() click_handler: (Track) => void

	@Listen("click")
	async play() {
		const controler = await get_player_controls()
		await controler.set_track(this.track)
		await controler.play()
		this.click_handler(this.track)
	}

	render() {
		return (
			<Host class="play_container_host">
				<slot />
			</Host>
		)
	}
}
