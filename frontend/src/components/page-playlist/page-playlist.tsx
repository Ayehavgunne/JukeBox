import {Component, h, Host, Prop, State, Watch} from "@stencil/core"
import {MatchResults} from "@stencil/router"
import {get_player_controls, print} from "../../global/app"
import {Track} from "../../global/models"
import state from "../../global/store"

@Component({
	tag: "page-playlist",
	styleUrl: "page-playlist.css",
})
export class PagePlaylist {
	@Prop() match: MatchResults
	@State() tracks: Array<Track>

	async componentWillLoad() {
		await this.load_page()
	}

	load_page = async () => {
		let result = await fetch(
			`/playlists/${state.user.user_id}/${this.match.params.name}`,
		)
		this.tracks = await result.json()
	}

	playing_track_handler = async () => {
		const controler = await get_player_controls()
		await controler.set_queue(this.tracks)
	}

	love_track = async (data: Track, popup_menu: HTMLPopupMenuElement) => {
		print("I love this track!", data)
		await popup_menu.hide()
	}

	play_track_next = async (data: Track, popup_menu: HTMLPopupMenuElement) => {
		print("play track next", data)
		await popup_menu.hide()
	}

	append_track_to_queue = async (data: Track, popup_menu: HTMLPopupMenuElement) => {
		print("append track to queue", data)
		await popup_menu.hide()
	}

	generate_popup_menu = track => {
		return (
			<popup-menu>
				<popup-menu-item click_action={this.love_track} data={track}>
					Love
				</popup-menu-item>
				<popup-menu-item click_action={this.play_track_next} data={track}>
					Play Next
				</popup-menu-item>
				<popup-menu-item click_action={this.append_track_to_queue} data={track}>
					Append to Queue
				</popup-menu-item>
			</popup-menu>
		)
	}

	@Watch("match")
	async match_handler() {
		await this.load_page()
	}

	render() {
		if (this.match && this.match.params.name) {
			return (
				<Host class="page_playlist_host">
					<virtual-scroll-tracks
						header={this.match.params.name}
						tracks={this.tracks}
						playing_track_handler={this.playing_track_handler}
						generate_popup_menu={this.generate_popup_menu}
					/>
				</Host>
			)
		} else {
			return <Host class="page_playlist_host" />
		}
	}
}
