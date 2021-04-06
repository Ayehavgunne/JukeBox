import {Component, h, Host, Listen, Prop, State} from "@stencil/core"
import {Track} from "../../global/models"
import {get_player_controls} from "../../global/app"
import {MatchResults} from "@stencil/router"
import {UAParser} from "ua-parser-js"

@Component({
	tag: "page-tracks",
	styleUrl: "page-tracks.css",
	shadow: true,
})
export class PageTracks {
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
		let ua_parser = new UAParser()
		ua_parser.setUA(navigator.userAgent)
		let device = ua_parser.getDevice()
		this.device_type = device.type
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
						{this.tracks.map(track => {
							return (
								<li>
									<play-container
										track={track}
										click_handler={this.playing_track_handler}
									>
										<div class="albumart">
											<img
												src={`/tracks/${track.track_id}/image`}
												alt={`image of ${track.title} album`}
												class="small"
											/>
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
											<div class="artist">{track.artist}</div>
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
						<th />
						<th>
							Track
							<br />
							No.
						</th>
						<th>Title</th>
						<th>Artist</th>
						<th>Album</th>
						<th>
							Disc
							<br />
							No.
						</th>
						<th>Year</th>
						<th>Length</th>
					</thead>
					<tbody>
						{this.tracks.map(track => {
							let tr_class = ""
							let playing_track =
								this.current_track &&
								this.current_track.track_id == track.track_id
							if (playing_track) {
								tr_class = "playing_row"
							}
							return (
								<tr key={track.track_id} class={tr_class}>
									<td class="first">
										{playing_track ? (
											<div class="playing">
												<div class="playing_bar bar-1" />
												<div class="playing_bar bar-2" />
												<div class="playing_bar bar-3" />
											</div>
										) : (
											<play-track
												track={track}
												click_handler={
													this.playing_track_handler
												}
											/>
										)}
									</td>
									<td class="second">{track.track_number}</td>
									<td>{track.title}</td>
									<td>{track.artist}</td>
									<td>{track.album}</td>
									<td class="fifth">{track.disc_number}</td>
									<td>{track.year}</td>
									<td class="last">
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
