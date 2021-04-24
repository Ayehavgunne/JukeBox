import {Component, Element, h, Host, Prop, State, Watch} from "@stencil/core"
import {Track} from "../../global/models"
import {get_player_controls, print} from "../../global/app"
import {MatchResults} from "@stencil/router"
import state from "../../global/store"

@Component({
	tag: "page-tracks",
	styleUrl: "page-tracks.css",
})
export class PageTracks {
	@Element() el: HTMLPageTracksElement
	@Prop() match: MatchResults
	@State() start_node = 0
	@State() tracks: Array<Track>
	@State() show_modal = false
	popup_menu
	track: Track

	async componentWillLoad() {
		await this.load_page()
	}

	load_page = async () => {
		let url = "/tracks"
		if (this.match && this.match.params.album_id) {
			url = `/albums/${this.match.params.album_id}/tracks`
		}
		let result = await fetch(url)
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

	choose_playlist_to_add_track_to = async (data: Track) => {
		print("showing playlist names to choose", data)
	}

	add_track_to_playlist = async (
		data: Track,
		popup_menu: HTMLPopupMenuElement,
		event: MouseEvent,
	) => {
		this.popup_menu = popup_menu
		this.track = data
		let target = event.target as HTMLElement
		let playlist_name = target.innerText
		if (playlist_name.trim() === "+ New Playlist") {
			this.show_modal = true
			return
		}
		await this.call_add_playlist(playlist_name)
	}

	call_add_playlist = async playlist_name => {
		let response = await fetch(
			`/playlists/${playlist_name}/${this.track.track_id}/${state.user.user_id}`,
			{method: "PUT"},
		)
		let result = await response.text()
		if (result === "Success") {
			response = await fetch(`/playlists/${state.user.user_id}`)
			state.playlist_names = await response.json()
		}
		await this.popup_menu.hide()
	}

	new_playlist = async playlist_name => {
		if (playlist_name) {
			await this.call_add_playlist(playlist_name)
		}
		this.show_modal = false
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
				<popup-menu-item
					click_action={this.choose_playlist_to_add_track_to}
					data={track}
					contains_submenu={true}
				>
					Add to a playlist
					<span slot="submenu">
						<popup-menu-item
							click_action={this.add_track_to_playlist}
							data={track}
						>
							+ New Playlist
						</popup-menu-item>
						{state.playlist_names.map(name => {
							return (
								<popup-menu-item
									click_action={this.add_track_to_playlist}
									data={track}
								>
									{name}
								</popup-menu-item>
							)
						})}
					</span>
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
		return (
			<Host class="page_tracks_host">
				{this.show_modal && (
					<modal-prompt
						header="Playlist Name?"
						close={this.new_playlist}
						show_cancel={true}
					/>
				)}
				<h3 class="page_header">Tracks</h3>
				<virtual-scroll-tracks
					tracks={this.tracks}
					playing_track_handler={this.playing_track_handler}
					generate_popup_menu={this.generate_popup_menu}
				/>
			</Host>
		)
	}
}
