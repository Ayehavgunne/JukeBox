import { Component, h, Listen, Prop } from "@stencil/core"
import { get_player_controls } from "../../global/app"

@Component({
	tag: "play-track",
	styleUrl: "play-track.css",
	shadow: true,
})
export class PlayTrack {
	@Prop() track_id: number

	@Listen("click")
	async play() {
		const controler = await get_player_controls()
		await controler.set_track(this.track_id)
		await controler.play()
	}

	render() {
		return <div />
	}
}
