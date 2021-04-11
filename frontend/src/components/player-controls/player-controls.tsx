import {
	Component,
	Element,
	Event,
	EventEmitter,
	h,
	Host,
	Method,
	State,
} from "@stencil/core"
import {Components} from "../../components"
import ProgressBar = Components.ProgressBar
import {Track} from "../../global/models"
import {worker} from "../../progress.worker?worker"
import {Howl} from "howler"
import {ua_parser} from "../../global/app"

const formats = ["m4a", "flac", "mp3"]

@Component({
	tag: "player-controls",
	styleUrl: "player-controls.css",
	// shadow: true,
})
export class PlayerControls {
	@Element() el: HTMLPlayerControlsElement
	@Event({eventName: "changing_track"}) changing_track: EventEmitter<Track>
	@State() paused: boolean = true
	@State() shuffle: boolean = false
	@State() volume_bar_hidden = true
	current_track: Howl
	current_track_data: Track
	nearing_track_end: boolean = false
	next_track: Howl
	next_track_data: Track
	ordered_playlist: Array<Track> = []
	os_hide_volume: boolean
	queue: Array<Track> = []
	queue_index: number = -1
	volume = 0.6
	volume_wrapper: HTMLDivElement
	volume_bar: HTMLDivElement

	constructor() {
		worker.addEventListener("message", async event => {
			let message = event.data
			if (message === "tick") {
				await this.timeupdate_handler()
			}
		})
		let os_name = ua_parser.getOS().name
		let device_type = ua_parser.getDevice().type
		this.os_hide_volume =
			os_name !== "iOS" && device_type !== "mobile" && device_type !== "tablet"
	}

	componentDidRender() {
		if (!this.volume_bar_hidden) {
			document.addEventListener("click", this.doc_hide_volume_bar)
		}
	}

	doc_hide_volume_bar = event => {
		if (!this.volume_wrapper.contains(event.target)) {
			this.volume_bar_hidden = true
			document.removeEventListener("click", this.doc_hide_volume_bar)
		}
	}

	@Method()
	async play_previous_track() {
		if (this.current_track) {
			if (this.current_track.seek() > 1.5) {
				this.current_track.seek(0)
			} else {
				await this.change_to_track(this.queue_index - 1)
			}
			worker.postMessage("start_progress")
		}
	}

	@Method()
	async play() {
		if (this.current_track) {
			this.current_track.play()
			worker.postMessage("start_progress")
		}
	}

	@Method()
	async play_next_track() {
		if (this.current_track) {
			// check if this.next_track has been loaded
			await this.change_to_track(this.queue_index + 1)
			worker.postMessage("start_progress")
		}
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
	async set_queue(tracks: Array<Track>) {
		this.queue = tracks
		this.ordered_playlist = tracks
		this.queue_index = this.queue.indexOf(this.current_track_data)
	}

	@Method()
	async add_next_in_queue(track: Track) {
		this.queue.splice(this.queue_index + 1, 0, track)
		this.ordered_playlist.splice(this.queue_index + 1, 0, track)
	}

	@Method()
	async append_to_queue(tracks: Array<Track>) {
		this.queue.concat(tracks)
		this.ordered_playlist.concat(tracks)
	}

	seek = async (percent: number) => {
		if (this.current_track) {
			this.current_track.seek((percent / 100) * this.current_track_data.length)
		}
	}

	play_handler = async () => {
		this.paused = false
	}

	pause_handler = async () => {
		this.paused = true
	}

	track_done = async () => {
		this.nearing_track_end = false
		await this.auto_change_to_next_track()
	}

	change_to_track = async track_index => {
		if (this.current_track) {
			this.current_track.stop()
			delete this.current_track
		}
		this.queue_index = track_index
		this.current_track_data = this.queue[this.queue_index]
		this.current_track = new Howl({
			src: "/stream/" + this.current_track_data.track_id,
			format: formats,
			volume: this.volume,
			html5: true,
		})
		this.add_event_listeners(this.current_track)
		this.changing_track.emit(this.current_track_data)
		this.current_track.play()
	}

	auto_change_to_next_track = async () => {
		// this.playlist_index = // loops index around when out of bounds
		// 	(this.playlist_index + 1 + this.playlist.length) % this.playlist.length
		this.queue_index += 1
		if (this.queue_index < this.queue.length) {
			this.current_track = this.next_track
			delete this.next_track
			this.play().then(() => {
				// nothin
			})
			this.current_track_data = this.queue[this.queue_index]
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
			this.queue = this.ordered_playlist
		}
	}

	preload_next_track = async () => {
		if (this.queue_index + 1 < this.queue.length) {
			console.log("preloading next track")
			this.next_track_data = this.queue[this.queue_index + 1]
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
			let progres_bar: ProgressBar = this.el.querySelector("progress-bar")
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
			this.queue[currentIndex] = this.ordered_playlist[randomIndex]
			this.queue[randomIndex] = temporaryValue
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

	// cache.delete

	render() {
		let speaker_class = "speaker -on"
		if (this.volume === 0) {
			speaker_class = "speaker -off"
		}
		let wrapper_class = "volume_wrapper hidden"
		if (!this.volume_bar_hidden) {
			wrapper_class = "volume_wrapper showing"
		}
		return (
			<Host class="player_controls_host">
				<div class="prev" onClick={this.play_previous_track.bind(this)} />
				<play-button
					paused={this.paused}
					toggle_playing={this.toggle_playing}
				/>
				<div class="next" onClick={this.play_next_track.bind(this)} />
				<track-stats track={this.current_track_data} />
				{this.os_hide_volume && (
					<div class="volume" onClick={this.toggle_volume_showing}>
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
				)}
				<progress-bar seek_handler={this.seek} />
			</Host>
		)
	}
}
