import {Component, h, Host, State} from "@stencil/core"
import {get_player_controls, print} from "../../global/app"
import state from "../../global/store"
import {Track} from "../../global/models"

@Component({
	tag: "page-now-playing",
	styleUrl: "page-now-playing.css",
})
export class PageNowPlaying {
	@State() show_modal = false
	player_controls
	popup_menu
	track: Track

	async componentWillRender() {
		this.player_controls = await get_player_controls()
	}

	playing_track_handler = async (track: Track) => {
		await this.player_controls.set_track(track)
		await this.player_controls.play()
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

	render() {
		// SVGs from Font Awsesome https://fontawesome.com/license/free
		return (
			<Host class="page_now_playing_host">
				{this.show_modal && (
					<modal-prompt
						header="Playlist Name?"
						close={this.new_playlist}
						show_cancel={true}
					/>
				)}
				<h3 class="page_header">Now Playing</h3>
				{state.current_track.track_id !== 0 && (
					<div class="current_track_info">
						<div>
							<img
								src={`/albums/${state.current_track.album_id}/image`}
								alt={`${state.current_track.title} album cover`}
								class="large"
							/>
						</div>
						<div class="track_title">
							<svg
								focusable="false"
								data-prefix="fas"
								data-icon="music"
								class="svg-inline--fa fa-music fa-w-16 small_icon icon"
								role="img"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 512 512"
							>
								<path
									fill="#15dea5"
									d="M470.38 1.51L150.41 96A32 32 0 0 0 128 126.51v261.41A139 139 0 0 0 96 384c-53 0-96 28.66-96 64s43 64 96 64 96-28.66 96-64V214.32l256-75v184.61a138.4 138.4 0 0 0-32-3.93c-53 0-96 28.66-96 64s43 64 96 64 96-28.65 96-64V32a32 32 0 0 0-41.62-30.49z"
								/>
							</svg>
							{state.current_track.title}
						</div>
						<div class="album_title">
							<svg
								focusable="false"
								data-prefix="fas"
								data-icon="compact-disc"
								class="svg-inline--fa fa-compact-disc fa-w-16 small_icon icon"
								role="img"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 496 512"
							>
								<path
									fill="#15dea5"
									d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zM88 256H56c0-105.9 86.1-192 192-192v32c-88.2 0-160 71.8-160 160zm160 96c-53 0-96-43-96-96s43-96 96-96 96 43 96 96-43 96-96 96zm0-128c-17.7 0-32 14.3-32 32s14.3 32 32 32 32-14.3 32-32-14.3-32-32-32z"
								/>
							</svg>
							{state.current_track.album}
						</div>
						<div class="artist_name">
							<svg
								focusable="false"
								data-prefix="fas"
								data-icon="user"
								class="svg-inline--fa fa-user fa-w-14 small_icon icon"
								role="img"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 448 512"
							>
								<path
									fill="#15dea5"
									d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"
								/>
							</svg>
							{state.current_track.artist}
						</div>
					</div>
				)}
				{state.queue && (
					<virtual-scroll-tracks
						tracks={state.queue}
						playing_track_handler={this.playing_track_handler}
						generate_popup_menu={this.generate_popup_menu}
						show_headers={false}
					/>
				)}
			</Host>
		)
	}
}
