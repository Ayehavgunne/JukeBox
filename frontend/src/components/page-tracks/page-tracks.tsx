import {Component, h, Host, Listen, Prop, State} from "@stencil/core"
import {Track} from "../../global/models"
import {get_player_controls, ua_parser} from "../../global/app"
import {MatchResults} from "@stencil/router"

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
		this.device_type = ua_parser.getDevice().type
	}

	playing_track_handler = async () => {
		const controler = await get_player_controls()
		await controler.set_playlist(this.tracks)
	}

	@Listen("changing_track", {target: "body"})
	changing_track_handler(event: CustomEvent<Track>) {
		this.current_track = event.detail
	}

	lazy_load = async () => {
		let lazyloadImages
		if ("IntersectionObserver" in window) {
			lazyloadImages = document.querySelectorAll(".lazy")
			let imageObserver = new IntersectionObserver(function (entries) {
				entries.forEach(function (entry) {
					if (entry.isIntersecting) {
						// @ts-ignore
						let image: HTMLImageElement = entry.target
						image.src = image.dataset.src
						image.classList.remove("lazy")
						imageObserver.unobserve(image)
					}
				})
			})

			lazyloadImages.forEach(function (image) {
				imageObserver.observe(image)
			})
		} else {
			let lazyloadThrottleTimeout
			lazyloadImages = document.querySelectorAll(".lazy")

			let lazyload = () => {
				if (lazyloadThrottleTimeout) {
					clearTimeout(lazyloadThrottleTimeout)
				}

				lazyloadThrottleTimeout = setTimeout(function () {
					let scrollTop = window.pageYOffset
					lazyloadImages.forEach(function (img) {
						if (img.offsetTop < window.innerHeight + scrollTop) {
							img.src = img.dataset.src
							img.classList.remove("lazy")
						}
					})
					if (lazyloadImages.length == 0) {
						document.removeEventListener("scroll", lazyload)
						window.removeEventListener("resize", lazyload)
						window.removeEventListener("orientationChange", lazyload)
					}
				}, 20)
			}

			document.addEventListener("scroll", lazyload)
			window.addEventListener("resize", lazyload)
			window.addEventListener("orientationChange", lazyload)
		}
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
											<play-container
												track={track}
												click_handler={
													this.playing_track_handler
												}
											>
												<div class="play_track" />
											</play-container>
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
