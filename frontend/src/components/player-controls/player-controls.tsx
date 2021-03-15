import {Component, Element, Event, EventEmitter, h, Method, State} from "@stencil/core"
import {Components} from "../../components"
import ProgressBar = Components.ProgressBar
import {Track} from "../../global/models"

@Component({
	tag: "player-controls",
	styleUrl: "player-controls.css",
	shadow: true,
})
export class PlayerControls {
	@Element() el: HTMLDivElement
	@Event() changing_track: EventEmitter<number>
	@State() current_track: Track
	@State() current_track_index: number = -1
	@State() paused: boolean = true
	@State() shuffle: boolean = false
	@State() nearing_track_end: boolean = false
	@State() playlist: Array<Track> = []
	@State() ordered_playlist: Array<Track> = []
	@State() audio: HTMLAudioElement = new Audio()
	@State() next_track: HTMLAudioElement
	progress_interval: number

	constructor() {
		this.add_event_listeners(this.audio)
	}

	@Method()
	async play() {
		let outcome = await this.audio.play()
		if (outcome === undefined) {
			// Automatic playback failed.
			// Show a UI element to let the user manually start playback.
		}
		this.paused = false
		this.progress_interval = setInterval(() => {
			let duration = this.audio.duration
			let current_time = this.audio.currentTime
			let progress = (current_time / duration) * 100
			let progres_bar: ProgressBar = this.el.shadowRoot.querySelector(
				"progress-bar",
			)
			progres_bar.progress = progress
			if (!this.nearing_track_end && duration - current_time < 30) {
				this.nearing_track_end = true
				this.preload_next_track()
			}
		}, 50)
	}

	@Method()
	async pause() {
		this.audio.pause()
		this.paused = true
		clearInterval(this.progress_interval)
	}

	@Method()
	async set_track(track: Track) {
		this.audio.src = "/play/" + track.track_id
		this.current_track = track
	}

	@Method()
	async set_playlist(tracks: Array<Track>) {
		this.playlist = tracks
		this.ordered_playlist = tracks
		this.current_track_index = this.playlist.indexOf(this.current_track)
	}

	track_done = async () => {
		this.nearing_track_end = false
		await this.change_to_next_track()
	}

	change_to_next_track = async () => {
		this.current_track_index += 1
		if (this.current_track_index < this.playlist.length) {
			this.audio = this.next_track
			await this.audio.play()
			this.current_track = this.playlist[this.current_track_index]
		}
	}

	toggle_playing = async () => {
		if (this.paused) {
			await this.play()
		} else {
			await this.pause()
		}
	}

	toggle_shuffle = async () => {
		this.shuffle = !this.shuffle
		if (this.shuffle) {
			await this.shuffle_playlist()
		} else {
			this.playlist = this.ordered_playlist
		}
	}

	preload_next_track = async () => {
		if (this.current_track_index + 1 < this.playlist.length) {
			console.log("preloading next track")
			this.next_track = new Audio(
				"/play/" + this.playlist[this.current_track_index + 1].track_id,
			)
			this.add_event_listeners(this.next_track)
		}
	}

	add_event_listeners = (audio: HTMLAudioElement) => {
		audio.addEventListener("ended", this.track_done)
		// audio.addEventListener("canplaythrough", () => {
		// 	console.log("can play through")
		// })
	}

	shuffle_playlist = async () => {
		let currentIndex = this.ordered_playlist.length,
			temporaryValue,
			randomIndex

		while (0 !== currentIndex) {
			randomIndex = Math.floor(Math.random() * currentIndex)
			currentIndex -= 1

			temporaryValue = this.ordered_playlist[currentIndex]
			this.playlist[currentIndex] = this.ordered_playlist[randomIndex]
			this.playlist[randomIndex] = temporaryValue
		}
	}

	render() {
		return (
			<div>
				<play-button
					paused={this.paused}
					toggle_playing={this.toggle_playing}
				/>
				<track-stats track={this.current_track} />
				<progress-bar />
			</div>
		)
	}
}
