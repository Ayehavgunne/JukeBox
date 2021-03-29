import {Component, Element, Event, EventEmitter, h, Method, State} from "@stencil/core"
import {Components} from "../../components"
import ProgressBar = Components.ProgressBar
import {Track} from "../../global/models"
import {worker} from "../../progress.worker?worker"
import {Howl} from "howler"

const formats = ["flac", "mp3", "m4a"]

@Component({
	tag: "player-controls",
	styleUrl: "player-controls.css",
	shadow: true,
})
export class PlayerControls {
	@Element() el: HTMLDivElement
	@Event() changing_track: EventEmitter<number>
	@State() current_track_data: Track
	@State() next_track_data: Track
	@State() playlist_index: number = -1
	@State() paused: boolean = true
	@State() shuffle: boolean = false
	@State() nearing_track_end: boolean = false
	@State() playlist: Array<Track> = []
	@State() ordered_playlist: Array<Track> = []
	current_track: Howl
	next_track: Howl

	constructor() {
		worker.addEventListener("message", async event => {
			let message = event.data
			if (message === "tick") {
				await this.timeupdate_handler()
			}
		})
	}

	@Method()
	async play() {
		this.current_track.play()
		this.paused = false
		worker.postMessage("start_progress")
	}

	@Method()
	async pause() {
		this.current_track.pause()
		worker.postMessage("stop_progress")
	}

	@Method()
	async set_track(track: Track) {
		if (this.current_track) {
			this.current_track.stop()
			delete this.current_track
		}
		this.current_track = new Howl({
			src: "/stream/" + track.track_id,
			format: formats,
			volume: 0.6,
			html5: true,
		})
		this.add_event_listeners(this.current_track)
		this.current_track_data = track
	}

	@Method()
	async set_playlist(tracks: Array<Track>) {
		this.playlist = tracks
		this.ordered_playlist = tracks
		this.playlist_index = this.playlist.indexOf(this.current_track_data)
	}

	pause_handler = async () => {
		this.paused = true
	}

	track_done = async () => {
		this.nearing_track_end = false
		await this.change_to_next_track()
	}

	change_to_next_track = async () => {
		this.playlist_index += 1
		if (this.playlist_index < this.playlist.length) {
			this.current_track = this.next_track
			delete this.next_track
			this.play().then(() => {
				// nothin
			})
			this.current_track_data = this.playlist[this.playlist_index]
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
		if (this.playlist_index + 1 < this.playlist.length) {
			console.log("preloading next track")
			this.next_track_data = this.playlist[this.playlist_index + 1]
			this.next_track = new Howl({
				src: "/get/" + this.next_track_data.track_id,
				format: formats,
				volume: 0.6,
			})
			this.add_event_listeners(this.next_track)
		}
	}

	timeupdate_handler = async () => {
		let duration = this.current_track_data.length
		if (this.current_track) {
			// @ts-ignore
			let current_time: number = this.current_track.seek() || 0
			let progress = (current_time / duration) * 100
			let progres_bar: ProgressBar = this.el.shadowRoot.querySelector(
				"progress-bar",
			)
			progres_bar.progress = progress
			if (!this.nearing_track_end && duration - current_time < 30) {
				this.nearing_track_end = true
				await this.preload_next_track()
			}
		}
	}

	add_event_listeners = (audio: Howl) => {
		audio.on("end", this.track_done)
		audio.on("pause", this.pause_handler)
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

	// var clickPosition = (e.pageX  - this.offsetLeft) / this.offsetWidth;
	// var clickTime = clickPosition * myAudio.duration;
	//
	// // move the playhead to the correct position
	// myAudio.currentTime = clickTime;

	render() {
		return (
			<div>
				<play-button
					paused={this.paused}
					toggle_playing={this.toggle_playing}
				/>
				<track-stats track={this.current_track_data} />
				<progress-bar />
			</div>
		)
	}
}
