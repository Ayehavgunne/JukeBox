import {Component, h, Host, State} from "@stencil/core"
import {Track} from "../../global/models"
import {get_player_controls} from "../../global/app"

@Component({
	tag: "page-tracks",
	styleUrl: "page-tracks.css",
	shadow: true,
})
export class PageTracks {
	@State() tracks: Array<Track>

	async componentWillLoad() {
		let result = await fetch("/tracks")
		this.tracks = await result.json()
	}

	playing_track_handler = async () => {
		const controler = await get_player_controls()
		await controler.set_playlist(this.tracks)
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
						<th>Genre</th>
						<th>Type</th>
						<th>Length</th>
					</thead>
					<tbody>
						{this.tracks.map(track => {
							return (
								<tr key={track.track_id}>
									<td class="first">
										<play-track
											track={track}
											click_handler={this.playing_track_handler}
										/>
									</td>
									<td class="second">{track.track_number}</td>
									<td>{track.title}</td>
									<td>{track.artist}</td>
									<td>{track.album}</td>
									<td class="fifth">{track.disc_number}</td>
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
