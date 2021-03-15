import {Component, Event, EventEmitter, h, Listen, Prop} from "@stencil/core"
import {get_player_controls} from "../../global/app"
import {Track} from "../../global/models"

@Component({
	tag: "play-track",
	styleUrl: "play-track.css",
	shadow: true,
})
export class PlayTrack {
	@Event() playing_track: EventEmitter<number>
	@Prop() track: Track
	@Prop() clickHandler: () => void

	@Listen("click")
	async play() {
		const controler = await get_player_controls()
		await controler.set_track(this.track)
		await controler.play()
		this.clickHandler()
	}

	render() {
		return <div />
	}
}
