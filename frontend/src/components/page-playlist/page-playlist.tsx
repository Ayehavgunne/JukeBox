import {Component, h, Host, Prop, State, Watch} from "@stencil/core"
import {injectHistory, MatchResults, RouterHistory} from "@stencil/router"
import {get_player_controls, print} from "../../global/app"
import {Playlist, Track} from "../../global/models"
import state from "../../global/store"

@Component({
	tag: "page-playlist",
	styleUrl: "page-playlist.css",
})
export class PagePlaylist {
	@Prop() match: MatchResults
	@Prop({mutable: true}) history: RouterHistory
	@State() playlist: Playlist
	@State() tracks: Array<Track>
	@State() show_name_modal = false
	@State() show_delete_modal = false
	@State() show_remove_modal = false
	track: Track

	async componentWillLoad() {
		await this.load_page()
	}

	load_page = async () => {
		this.playlist = {
			playlist_name: this.match.params.name,
			user: state.user,
		}
		let result = await fetch(
			`/playlists/${this.playlist.user.user_id}/${this.playlist.playlist_name}`,
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

	remove_track = async (data: Track, popup_menu: HTMLPopupMenuElement) => {
		this.show_remove_modal = true
		this.track = data
		await popup_menu.hide()
	}

	rename_playlist = async (_, popup_menu: HTMLPopupMenuElement) => {
		this.show_name_modal = true
		await popup_menu.hide()
	}

	delete_playlist = async (_, popup_menu: HTMLPopupMenuElement) => {
		this.show_delete_modal = true
		await popup_menu.hide()
	}

	close_name_modal = (new_name: string) => {
		this.show_name_modal = false
		if (new_name) {
			fetch(
				`/playlists/${this.playlist.user.user_id}/${this.playlist.playlist_name}/${new_name}`,
			)
				.then(response => {
					return response.json()
				})
				.then(response => {
					state.playlist_names = response
					this.history.replace(`/page/playlist/${new_name}`, {})
				})
		}
	}

	close_delete_modal = (confirmation: string) => {
		this.show_delete_modal = false
		if (confirmation === "okay") {
			fetch(
				`/playlists/${this.playlist.user.user_id}/${this.playlist.playlist_name}`,
				{method: "DELETE"},
			)
				.then(response => {
					return response.json()
				})
				.then(response => {
					state.playlist_names = response
					this.history.replace("/", {})
				})
		}
	}

	remove_track_modal = async (confirmation: string) => {
		this.show_remove_modal = false
		if (confirmation === "okay") {
			let response = await fetch(
				`/playlists/${this.playlist.playlist_name}/${this.track.track_id}/${state.user.user_id}`,
				{method: "DELETE"},
			)
			let result = await response.text()
			if (result === "Success") {
				let index = this.tracks.indexOf(this.track)
				this.tracks.splice(index, 1)
				this.tracks = [...this.tracks]
			}
		}
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
				<popup-menu-item click_action={this.remove_track} data={track}>
					Remove from Playlist
				</popup-menu-item>
			</popup-menu>
		)
	}

	@Watch("match")
	async match_handler() {
		await this.load_page()
	}

	render() {
		if (this.playlist.playlist_name) {
			return (
				<Host class="page_playlist_host">
					{this.show_name_modal && (
						<modal-prompt
							header="New Playlist Name?"
							close={this.close_name_modal}
							show_cancel={true}
						/>
					)}
					{this.show_delete_modal && (
						<modal-prompt
							header="Are you sure you want to delete this playlist?"
							close={this.close_delete_modal}
							show_input={false}
						/>
					)}
					{this.show_remove_modal && (
						<modal-prompt
							header="Are you sure you want to remove that track?"
							close={this.remove_track_modal}
							show_input={false}
						/>
					)}
					<h3 class="page_header playlist_header">
						<span>{this.playlist.playlist_name}</span>
						<popup-menu>
							<popup-menu-item
								click_action={this.rename_playlist}
								data={this.playlist}
							>
								Rename
							</popup-menu-item>
							<popup-menu-item
								click_action={this.delete_playlist}
								data={this.playlist}
							>
								Delete
							</popup-menu-item>
						</popup-menu>
					</h3>
					<virtual-scroll-tracks
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

injectHistory(PagePlaylist)
