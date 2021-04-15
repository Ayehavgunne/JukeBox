import {Component, h, Host, Prop, State, Watch} from "@stencil/core"
import {MatchResults} from "@stencil/router"
import {get_player_controls, print} from "../../global/app"
import {Track} from "../../global/models"
import store from "../../global/store"

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

	generate_album_art = (track, playing_track) => {
		return (
			<div class="albumart">
				<cache-img
					src={`/albums/${track.album_id}/image`}
					alt={`${track.title} album`}
					placeholder="/assets/generic_album.png"
					class="small"
				/>
				{playing_track ? (
					<div class="playing on_image">
						<div class="playing_bar bar-1" />
						<div class="playing_bar bar-2" />
						<div class="playing_bar bar-3" />
					</div>
				) : (
					<div class="play_track" />
				)}
			</div>
		)
	}

	generate_desktop = track => {
		let playing_track =
			store.current_track && store.current_track.track_id == track.track_id
		return (
			<div class="row" key={track.track_id}>
				<div class="menu cell">{this.generate_popup_menu(track)}</div>
				<play-container
					track={track}
					click_handler={this.playing_track_handler}
					class="cell"
				>
					{this.generate_album_art(track, playing_track)}
				</play-container>
				<div class="number cell">{track.track_number}</div>
				<div class="cell">{track.title}</div>
				<div class="cell">{track.artist}</div>
				<div class="cell">{track.album}</div>
				<div class="number cell">{track.disc_number}</div>
				<div class="number cell">{track.year}</div>
				<div class="number cell">
					{new Date(track.length * 1000).toISOString().substr(14, 5)}
				</div>
			</div>
		)
	}

	load_page = async () => {
		let result = await fetch(
			`/playlists/${store.user.user_id}/${this.match.params.name}`,
		)
		this.tracks = await result.json()
	}

	@Watch("match")
	async match_handler() {
		await this.load_page()
	}

	render() {
		if (this.match && this.match.params.name) {
			return (
				<Host class="page_playlist_host">
					<h3 class="page_header">{this.match.params.name}</h3>
					<div class="body">
						<div class="header" />
						<div class="header" />
						<div class="header">No.</div>
						<div class="header">Title</div>
						<div class="header">Artist</div>
						<div class="header">Album</div>
						<div class="header">Disc</div>
						<div class="header">Year</div>
						<div class="header">Length</div>
						{this.tracks.map(track => {
							return this.generate_desktop(track)
						})}
					</div>
				</Host>
			)
		} else {
			return <Host class="page_playlist_host" />
		}
	}
}
