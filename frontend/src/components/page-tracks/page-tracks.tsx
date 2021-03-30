import {Component, h, Host, Listen, State} from "@stencil/core"
import {Track} from "../../global/models"
import {get_player_controls} from "../../global/app"

@Component({
	tag: "page-tracks",
	styleUrl: "page-tracks.css",
	shadow: true,
})
export class PageTracks {
	@State() tracks: Array<Track>
	@State() current_track: Track

	async componentWillLoad() {
		let result = await fetch("/tracks")
		this.tracks = await result.json()
	}

	playing_track_handler = async () => {
		const controler = await get_player_controls()
		await controler.set_playlist(this.tracks)
	}

	@Listen("changing_track", {target: "body"})
	changing_track_handler(event: CustomEvent<Track>) {
		console.log(event.detail)
		this.current_track = event.detail
	}

	render() {
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
						<th>Genre</th>
						<th>Type</th>
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
									<td>{track.genre}</td>
									<td>{track.codec}</td>
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
