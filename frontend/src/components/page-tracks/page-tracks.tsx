import {Component, h, Host, Element, Listen, Prop, State} from "@stencil/core"
import {Track} from "../../global/models"
import {get_player_controls, lazy_load, ua_parser} from "../../global/app"
import {MatchResults} from "@stencil/router"

@Component({
	tag: "page-tracks",
	styleUrl: "page-tracks.css",
	shadow: true,
})
export class PageTracks {
	@Element() el: HTMLPageTracksElement
	@Prop() match: MatchResults
	@Prop({mutable: true}) current_track: Track
	@State() tracks: Array<Track>
	@State() device_type: string

	async componentWillLoad() {
		let url = "/tracks"
		if (this.match && this.match.params.album_id) {
			url = `/albums/${this.match.params.album_id}/tracks`
		}
		let result = await fetch(url)
		this.tracks = await result.json()
		this.device_type = ua_parser.getDevice().type
	}

	async componentDidRender() {
		await lazy_load(this.el)
	}

	playing_track_handler = async () => {
		const controler = await get_player_controls()
		await controler.set_playlist(this.tracks)
	}

	@Listen("changing_track", {target: "body"})
	changing_track_handler(event: CustomEvent<Track>) {
		this.current_track = event.detail
	}

	render() {
		if (this.device_type === "mobile") {
			return (
				<Host>
					<h3>Tracks</h3>
					<ul>
						{this.tracks.map((track, index) => {
							let playing_track =
								this.current_track &&
								this.current_track.track_id == track.track_id
							let image
							if (index < 15) {
								image = (
									<img
										src={`/albums/${track.album_id}/image`}
										alt={`image of ${track.title} album`}
										class="small"
									/>
								)
							} else {
								image = (
									<img
										src=""
										data-src={`/albums/${track.album_id}/image`}
										alt={`image of ${track.title} album`}
										class="small lazy"
									/>
								)
							}
							return (
								<li>
									<play-container
										track={track}
										click_handler={this.playing_track_handler}
									>
										<div class="albumart">
											{image}
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
						})}
					</ul>
				</Host>
			)
		}
		return (
			<Host>
				<h3>Tracks</h3>
				<table>
					<thead>
						{/*<th />*/}
						<th />
						<th>No.</th>
						<th>Title</th>
						<th>Artist</th>
						<th>Album</th>
						<th>Disc</th>
						<th>Year</th>
						<th>Length</th>
					</thead>
					<tbody>
						{this.tracks.map((track, index) => {
							let tr_class = ""
							let playing_track =
								this.current_track &&
								this.current_track.track_id == track.track_id
							if (playing_track) {
								tr_class = "playing_row"
							}
							let image
							if (index < 30) {
								image = (
									<img
										src={`/albums/${track.album_id}/image`}
										alt={`image of ${track.title} album`}
										class="small"
									/>
								)
							} else {
								image = (
									<img
										src=""
										data-src={`/albums/${track.album_id}/image`}
										alt={`image of ${track.title} album`}
										class="small lazy"
									/>
								)
							}
							return (
								<tr key={track.track_id} class={tr_class}>
									<td>
										<play-container
											track={track}
											click_handler={this.playing_track_handler}
											class="albumart"
										>
											{image}
											{playing_track ? (
												<div class="playing_bars">
													<div class="playing_bar bar-1" />
													<div class="playing_bar bar-2" />
													<div class="playing_bar bar-3" />
												</div>
											) : (
												<div class="play_track" />
											)}
										</play-container>
									</td>
									<td class="number">{track.track_number}</td>
									<td>{track.title}</td>
									<td>{track.artist}</td>
									<td>{track.album}</td>
									<td class="number">{track.disc_number}</td>
									<td class="number">{track.year}</td>
									<td class="number">
										{new Date(track.length * 1000)
											.toISOString()
											.substr(14, 5)}
									</td>
								</tr>
							)
						})}
					</tbody>
				</table>
			</Host>
		)
	}
}
