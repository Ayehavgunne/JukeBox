import {Component, Element, h, Host, Listen, Prop, State, Watch} from "@stencil/core"
import {Track} from "../../global/models"
import {get_player_controls, print, ua_parser} from "../../global/app"
import {MatchResults} from "@stencil/router"
import store from "../../global/store"

@Component({
	tag: "page-tracks",
	styleUrl: "page-tracks.css",
})
export class PageTracks {
	@Element() el: HTMLPageTracksElement
	@Prop() match: MatchResults
	@State() start_node = 0
	@State() tracks: Array<Track>
	device_type: string
	row_height = 60
	offset_y = 0
	total_rows_height = 0
	buffer_rows = 50
	container_height = 0
	ticking = false

	async componentWillLoad() {
		this.device_type = ua_parser.getDevice().type
		await this.load_page()
	}

	calc_start_node = (element: HTMLElement) => {
		this.start_node =
			Math.floor(element.scrollTop / this.row_height) - this.buffer_rows
		this.start_node = Math.max(0, this.start_node)
	}

	calc_offset_y = () => {
		this.offset_y = this.start_node * this.row_height
	}

	visible_row_count = () => {
		let visible_count =
			Math.ceil(this.container_height / this.row_height) + 2 * this.buffer_rows
		return Math.min(this.tracks.length - this.start_node, visible_count)
	}

	visible_rows = () => {
		let row_count = this.visible_row_count()
		let generate
		if (this.device_type === "mobile") {
			generate = this.generate_mobile
		} else {
			generate = this.generate_desktop
		}
		return new Array(row_count).fill(null).map((_, index) => {
			return generate(index + this.start_node)
		})
	}

	playing_track_handler = async () => {
		const controler = await get_player_controls()
		await controler.set_queue(this.tracks)
	}

	love_track = async (data: Track, popup_menu: HTMLPopupMenuElement) => {
		print("I love this track!", data)
		await popup_menu.hide()
	}

	add_track_to_playlist = async (data: Track) => {
		print("add track to playlist", data)
	}

	play_track_next = async (data: Track, popup_menu: HTMLPopupMenuElement) => {
		print("play track next", data)
		await popup_menu.hide()
	}

	append_track_to_queue = async (data: Track, popup_menu: HTMLPopupMenuElement) => {
		print("append track to queue", data)
		await popup_menu.hide()
	}

	load_page = async () => {
		let url = "/tracks"
		if (this.match && this.match.params.album_id) {
			url = `/albums/${this.match.params.album_id}/tracks`
		}
		let result = await fetch(url)
		this.tracks = await result.json()
		this.calc_start_node(this.el)
		this.calc_offset_y()
		this.total_rows_height = this.tracks.length * this.row_height + 22
		this.container_height = this.el.parentElement.parentElement.parentElement.parentElement.offsetHeight
	}

	scroll_handler = (event: MouseEvent) => {
		if (!this.ticking) {
			window.requestAnimationFrame(async () => {
				let target = event.target as HTMLElement
				this.calc_start_node(target)
				this.calc_offset_y()
				this.ticking = false
			})
			this.ticking = true
		}
	}

	@Listen("changing_track", {target: "body"})
	changing_track_handler(event: CustomEvent<Track>) {
		store.current_track = event.detail
	}

	@Watch("match")
	async match_handler() {
		await this.load_page()
	}

	generate_mobile = index => {
		let track = this.tracks[index]
		let playing_track =
			store.current_track && store.current_track.track_id == track.track_id
		return (
			<li key={track.track_id}>
				<div class="menu cell">
					<popup-menu>
						<popup-menu-item click_action={this.love_track} data={track}>
							Love
						</popup-menu-item>
						<popup-menu-item
							click_action={this.add_track_to_playlist}
							data={track}
						>
							Add to a playlist
						</popup-menu-item>
						<popup-menu-item
							click_action={this.play_track_next}
							data={track}
						>
							Play Next
						</popup-menu-item>
						<popup-menu-item
							click_action={this.append_track_to_queue}
							data={track}
						>
							Append to Queue
						</popup-menu-item>
					</popup-menu>
				</div>
				<play-container
					track={track}
					click_handler={this.playing_track_handler}
				>
					<div class="albumart">
						<cache-img
							src={`/albums/${track.album_id}/image`}
							alt={`image of ${track.title} album`}
							placeholder="/assets/generic_album.png"
							class="small"
						/>
						{playing_track && (
							<div class="playing on_image">
								<div class="playing_bar bar-1" />
								<div class="playing_bar bar-2" />
								<div class="playing_bar bar-3" />
							</div>
						)}
					</div>
				</play-container>
				<play-container
					track={track}
					click_handler={this.playing_track_handler}
				>
					<div class="info">
						<div class="title">
							{track.track_number} - {track.title}
						</div>
						<div class="artist">
							{track.artist} - {track.album}
						</div>
					</div>
				</play-container>
			</li>
		)
	}

	generate_desktop = index => {
		let track = this.tracks[index]
		let playing_track =
			store.current_track && store.current_track.track_id == track.track_id
		return (
			<div class="row" key={track.track_id}>
				<div class="menu cell">
					<popup-menu>
						<popup-menu-item click_action={this.love_track} data={track}>
							Love
						</popup-menu-item>
						<popup-menu-item
							click_action={this.add_track_to_playlist}
							data={track}
						>
							Add to a playlist
						</popup-menu-item>
						<popup-menu-item
							click_action={this.play_track_next}
							data={track}
						>
							Play Next
						</popup-menu-item>
						<popup-menu-item
							click_action={this.append_track_to_queue}
							data={track}
						>
							Append to Queue
						</popup-menu-item>
					</popup-menu>
				</div>
				<play-container
					track={track}
					click_handler={this.playing_track_handler}
					class="cell"
				>
					<div class="albumart">
						<cache-img
							src={`/albums/${track.album_id}/image`}
							alt={`image of ${track.title} album`}
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

	render() {
		if (this.device_type === "mobile") {
			return (
				<Host class="page_tracks_host">
					<div class="tracks_container" onScroll={this.scroll_handler}>
						<h3 class="page_header">Tracks</h3>
						<div
							class="tracks_table_container"
							style={{
								height: `${this.total_rows_height}px`,
							}}
						>
							<ul style={{transform: `translateY(${this.offset_y}px`}}>
								{this.visible_rows()}
							</ul>
						</div>
					</div>
				</Host>
			)
		}
		return (
			<Host class="page_tracks_host">
				<div class="tracks_container" onScroll={this.scroll_handler}>
					<h3 class="page_header">Tracks</h3>
					<div
						class="tracks_table_container"
						style={{
							height: `${this.total_rows_height}px`,
						}}
					>
						<div
							class="table"
							style={{height: `${this.container_height - 55}px`}}
						>
							<div
								class="body"
								style={{
									transform: `translateY(${this.offset_y}px`,
									willChange: "transform",
								}}
							>
								<div class="header" />
								<div class="header" />
								<div class="header">No.</div>
								<div class="header">Title</div>
								<div class="header">Artist</div>
								<div class="header">Album</div>
								<div class="header">Disc</div>
								<div class="header">Year</div>
								<div class="header">Length</div>
								{this.visible_rows()}
							</div>
						</div>
					</div>
				</div>
			</Host>
		)
	}
}
