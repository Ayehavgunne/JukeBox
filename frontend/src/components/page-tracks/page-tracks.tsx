import {Component, h, State} from "@stencil/core"
import {Track} from "../../global/models"

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

	render() {
		return (
			<div class="table_container">
				<div class="top_cover" />
				<div class="right_cover" />
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
						<th>Length</th>
					</thead>
					<tbody>
						{this.tracks.map(row => {
							return (
								<tr>
									<td class="first">
										<play-track track_id={row.track_id} />
									</td>
									<td class="second">{row.track_number}</td>
									<td>{row.title}</td>
									<td>{row.artist}</td>
									<td>{row.album}</td>
									<td class="fifth">{row.disc_number}</td>
									<td>{row.genre}</td>
									<td class="last">
										{new Date(row.length * 1000)
											.toISOString()
											.substr(14, 5)}
									</td>
								</tr>
							)
						})}
					</tbody>
				</table>
			</div>
		)
	}
}
