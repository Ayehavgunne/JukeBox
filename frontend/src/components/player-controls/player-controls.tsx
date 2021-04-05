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
	@Element() el: HTMLPlayerControlsElement
	@Event({eventName: "changing_track"}) changing_track: EventEmitter<Track>
	@State() current_track_data: Track
	@State() next_track_data: Track
	@State() playlist_index: number = -1
	@State() paused: boolean = true
	@State() shuffle: boolean = false
	@State() nearing_track_end: boolean = false
	@State() playlist: Array<Track> = []
	@State() ordered_playlist: Array<Track> = []
	@State() volume_bar_hidden = true
	@State() volume = 0.6
	current_track: Howl
	next_track: Howl
	volume_button: HTMLDivElement
	volume_wrapper: HTMLDivElement
	volume_bar: HTMLDivElement

	constructor() {
		worker.addEventListener("message", async event => {
			let message = event.data
			if (message === "tick") {
				await this.timeupdate_handler()
			}
		})
	}

	componentDidRender() {
		if (!this.volume_bar_hidden) {
			document.addEventListener("click", this.doc_hide_volume_bar)
		}
	}

	doc_hide_volume_bar = event => {
		if (event.target !== this.volume_button && !this.el.contains(event.target)) {
			this.volume_bar_hidden = true
			document.removeEventListener("click", this.doc_hide_volume_bar)
		}
	}

	@Method()
	async play() {
		this.current_track.play()
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
			volume: this.volume,
			html5: true,
		})
		this.add_event_listeners(this.current_track)
		this.current_track_data = track
		this.changing_track.emit(this.current_track_data)
	}

	@Method()
	async set_playlist(tracks: Array<Track>) {
		this.playlist = tracks
		this.ordered_playlist = tracks
		this.playlist_index = this.playlist.indexOf(this.current_track_data)
	}

	play_handler = async () => {
		this.paused = false
	}

	pause_handler = async () => {
		this.paused = true
	}

	track_done = async () => {
		this.nearing_track_end = false
		await this.change_to_next_track()
	}

	change_to_next_track = async () => {
		// this.playlist_index = // loops index around when gets too big
		// 	(this.playlist_index + 1 + this.playlist.length) % this.playlist.length
		this.playlist_index += 1
		if (this.playlist_index < this.playlist.length) {
			this.current_track = this.next_track
			delete this.next_track
			this.play().then(() => {
				// nothin
			})
			this.current_track_data = this.playlist[this.playlist_index]
			this.changing_track.emit(this.current_track_data)
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
				volume: this.volume,
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
		audio.on("play", this.play_handler)
		audio.on("pause", this.pause_handler)
		audio.on("end", this.track_done)
		// @ts-ignore
		let node = audio._sounds[0]._node
		node.onpause = async function () {
			await this.pause_handler()
		}.bind(this)
		node.onplaying = async function () {
			await this.play_handler()
		}.bind(this)
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

	toggle_volume_showing = event => {
		if (
			event.target !== this.volume_wrapper &&
			!this.volume_wrapper.contains(event.target)
		) {
			this.volume_bar_hidden = !this.volume_bar_hidden
		}
	}

	change_volume = volume => {
		this.volume = volume
		this.current_track?.volume(this.volume)
		this.next_track?.volume(this.volume)
	}

	// var clickPosition = (e.pageX  - this.offsetLeft) / this.offsetWidth;
	// var clickTime = clickPosition * myAudio.duration;
	//
	// // move the playhead to the correct position
	// myAudio.currentTime = clickTime;

	render() {
		let speaker_class = "speaker -on"
		if (this.volume === 0) {
			speaker_class = "speaker -off"
		}
		let wrapper_class = "wrapper hidden"
		if (!this.volume_bar_hidden) {
			wrapper_class = "wrapper showing"
		}
		return (
			<div class="container">
				<play-button
					paused={this.paused}
					toggle_playing={this.toggle_playing}
				/>
				<track-stats track={this.current_track_data} />
				<div
					class="volume"
					onClick={this.toggle_volume_showing}
					ref={el => (this.volume_button = el as HTMLDivElement)}
				>
					<div class={speaker_class} />
					<div
						class={wrapper_class}
						ref={el => (this.volume_wrapper = el as HTMLDivElement)}
					>
						<div
							class="bar"
							ref={el => (this.volume_bar = el as HTMLDivElement)}
						>
							<volume-dot
								volume={this.volume}
								parent={this.volume_bar}
								volume_handler={this.change_volume}
							/>
						</div>
					</div>
				</div>
				<progress-bar />
			</div>
		)
	}
}
