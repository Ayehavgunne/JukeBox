import {Component, h, Host, Prop, State, Watch} from "@stencil/core"
import {Artist, Track} from "../../global/models"
import {MatchResults} from "@stencil/router"
import state from "../../global/store"
import {get_player_controls, print} from "../../global/app"

@Component({
	tag: "page-artists",
	styleUrl: "page-artists.css",
})
export class PageArtists {
	@Prop() match: MatchResults
	@State() artists: Array<Artist>
	@State() tracks: Array<Track>
	@State() artist: Artist
	@State() show_modal = false
	popup_menu
	track: Track

	async componentWillLoad() {
		await this.load_page()
	}

	load_page = async () => {
		let url = "/artists"
		if (this.match && this.match.params.artist_id) {
			url = `/artists/${this.match.params.artist_id}/tracks`
			let result = await fetch(url)
			this.tracks = await result.json()
			result = await fetch(`/artists/${this.match.params.artist_id}`)
			let artist_list = await result.json()
			this.artist = artist_list[0]
		} else {
			let result = await fetch(url)
			this.artists = await result.json()
		}
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
			{method: "POST"},
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
		if (this.artists) {
			return (
				<Host class="page_artists_host artists">
					<h3 class="page_header">Artists</h3>
					<ul>
						{this.artists.map(artist => {
							return (
								<li>
									<stencil-route-link
										url={`/page/albums/${artist.artist_id}`}
									>
										<div class="artist_image">
											<cache-img
												src={`/artists/${artist.artist_id}/image`}
												alt={`image of ${artist.name}`}
												placeholder="/assets/generic_artist.png"
												classes="medium"
											/>
										</div>
										<div class="name">{artist.name}</div>
									</stencil-route-link>
								</li>
							)
						})}
					</ul>
				</Host>
			)
		}
		return (
			<Host class="page_artists_host tracks">
				{this.show_modal && (
					<modal-prompt
						header="Playlist Name?"
						close={this.new_playlist}
						show_cancel={true}
					/>
				)}
				<h3 class="page_header">{this.artist.name}</h3>
				<virtual-scroll-tracks
					tracks={this.tracks}
					playing_track_handler={this.playing_track_handler}
					generate_popup_menu={this.generate_popup_menu}
				/>
			</Host>
		)
	}
}
