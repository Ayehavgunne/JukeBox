import {Component, Host, h, Prop, State, Element} from "@stencil/core"
import {ua_parser} from "../../global/app"
import {Track} from "../../global/models"
import state from "../../global/store"

@Component({
	tag: "virtual-scroll-tracks",
	styleUrl: "virtual-scroll-tracks.css",
})
export class VirtualScrollTracks {
	@Element() el: HTMLVirtualScrollTracksElement
	@Prop() tracks: Array<Track>
	@Prop() playing_track_handler: (Track) => void
	@Prop() generate_popup_menu: (Track) => HTMLPopupMenuElement
	@Prop() show_headers? = true
	@State() start_node = 0
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

	load_page = async () => {
		this.calc_start_node(this.el)
		this.calc_offset_y()
		this.total_rows_height = this.tracks.length * this.row_height + 22
		this.container_height = this.el.parentElement.parentElement.parentElement.parentElement.offsetHeight
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

	generate_album_art = (track, playing_track) => {
		return (
			<div class="albumart">
				<cache-img
					src={`/albums/${track.album_id}/image`}
					alt={`${track.title} album cover`}
					placeholder="/assets/generic_album.png"
					classes="small"
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

	generate_mobile = index => {
		let track = this.tracks[index]
		let playing_track =
			state.current_track && state.current_track.track_id == track.track_id
		return (
			<li key={track.track_id}>
				<div class="menu">{this.generate_popup_menu(track)}</div>
				<play-container
					track={track}
					click_handler={this.playing_track_handler}
				>
					{this.generate_album_art(track, playing_track)}
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
			state.current_track && state.current_track.track_id == track.track_id
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

	body = () => {
		if (this.device_type === "mobile") {
			return (
				<div class="tracks_container" onScroll={this.scroll_handler}>
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
			)
		}
		return (
			<div class="tracks_container" onScroll={this.scroll_handler}>
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
							{this.show_headers && <div class="header" />}
							{this.show_headers && <div class="header" />}
							{this.show_headers && <div class="header">No.</div>}
							{this.show_headers && <div class="header">Title</div>}
							{this.show_headers && <div class="header">Artist</div>}
							{this.show_headers && <div class="header">Album</div>}
							{this.show_headers && <div class="header">Disc</div>}
							{this.show_headers && <div class="header">Year</div>}
							{this.show_headers && <div class="header">Length</div>}
							{this.visible_rows()}
						</div>
					</div>
				</div>
			</div>
		)
	}

	render() {
		return <Host>{this.body()}</Host>
	}
}
