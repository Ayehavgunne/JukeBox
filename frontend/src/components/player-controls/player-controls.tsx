import {Component, Element, h, Host, Listen, Method, State} from "@stencil/core"
import {Components} from "../../components"
import ProgressBar = Components.ProgressBar
import {Track} from "../../global/models"
import {worker} from "../../progress.worker?worker"
import {Howl} from "howler"
import {print, ua_parser} from "../../global/app"
import state from "../../global/store"
import Cookies from "js-cookie"

const formats = ["m4a", "flac", "mp3"]

@Component({
	tag: "player-controls",
	styleUrl: "player-controls.css",
})
export class PlayerControls {
	@Element() el: HTMLPlayerControlsElement
	@State() paused: boolean = true
	@State() shuffle: boolean = false
	@State() volume_bar_hidden = true
	current_track_audio: Howl
	next_track_audio: Howl
	nearing_track_end: boolean = false
	next_track_data: Track
	ordered_queue: Array<Track> = []
	os_hide_volume: boolean
	// queue: Array<Track> = []
	// queue_index: number = -1
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
		let volume_cookie = Cookies.get("jukebox-volume")
		let volume: number
		if (volume_cookie === undefined) {
			volume = this.volume
			Cookies.set("jukebox-volume", volume + "")
		} else {
			volume = parseFloat(volume_cookie)
		}
		this.volume = volume
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
		if (this.current_track_audio) {
			if (this.current_track_audio.seek() > 1.5) {
				this.current_track_audio.seek(0)
			} else {
				await this.change_to_track(state.queue_index - 1)
			}
			worker.postMessage("start_progress")
		}
	}

	@Method()
	async play() {
		if (this.current_track_audio) {
			this.current_track_audio.play()
			worker.postMessage("start_progress")
		}
	}

	@Method()
	async play_next_track() {
		if (this.current_track_audio) {
			// check if this.next_track has been loaded
			await this.change_to_track(state.queue_index + 1)
			worker.postMessage("start_progress")
		}
	}

	@Method()
	async pause() {
		this.current_track_audio.pause()
		worker.postMessage("stop_progress")
	}

	@Method()
	async set_track(track: Track) {
		if (this.current_track_audio) {
			this.current_track_audio.stop()
			delete this.current_track_audio
		}
		this.current_track_audio = new Howl({
			src: "/stream/" + track.track_id,
			format: formats,
			volume: this.volume,
			html5: true,
		})
		this.add_event_listeners(this.current_track_audio)
		state.current_track = track
		document.title = state.current_track.title + " - JukeBox"
		state.queue_index = state.queue.indexOf(track)
	}

	@Method()
	async set_queue(tracks: Array<Track>) {
		state.queue = tracks
		this.ordered_queue = tracks
		state.queue_index = state.queue.indexOf(state.current_track)
	}

	@Method()
	async add_next_in_queue(track: Track) {
		state.queue.splice(state.queue_index + 1, 0, track)
		this.ordered_queue.splice(state.queue_index + 1, 0, track)
	}

	@Method()
	async append_to_queue(tracks: Array<Track>) {
		state.queue.concat(tracks)
		this.ordered_queue.concat(tracks)
	}

	seek = async (percent: number) => {
		if (this.current_track_audio) {
			this.current_track_audio.seek((percent / 100) * state.current_track.length)
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
		if (this.current_track_audio) {
			this.current_track_audio.stop()
			delete this.current_track_audio
		}
		if (track_index < state.queue.length) {
			state.queue_index = track_index
			state.current_track = state.queue[state.queue_index]
			this.current_track_audio = new Howl({
				src: "/stream/" + state.current_track.track_id,
				format: formats,
				volume: this.volume,
				html5: true,
			})
			document.title = state.current_track.title + " - JukeBox"
			this.add_event_listeners(this.current_track_audio)
			this.current_track_audio.play()
		} else {
			state.current_track = {
				track_id: 0,
				title: "",
				album: "",
				album_id: 0,
				album_disc: 0,
				artist: "",
				track_number: 0,
				disc_number: 0,
				year: 0,
				genre: "",
				compilation: "",
				length: 0,
				mimetype: "",
				codec: "",
				bitrate: 0,
				size: 0,
			}
			let progres_bar: ProgressBar = this.el.querySelector("progress-bar")
			progres_bar.progress = 0
			progres_bar.current_time = 0
		}
	}

	auto_change_to_next_track = async () => {
		// this.playlist_index = // loops index around when out of bounds
		// 	(this.playlist_index + 1 + this.playlist.length) % this.playlist.length
		state.queue_index += 1
		if (state.queue_index < state.queue.length) {
			this.current_track_audio = this.next_track_audio
			delete this.next_track_audio
			this.play().then(() => {
				// nothin
			})
			state.current_track = state.queue[state.queue_index]
			document.title = state.current_track.title + " - JukeBox"
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
			state.queue = this.ordered_queue
		}
	}

	preload_next_track = async () => {
		if (state.queue_index + 1 < state.queue.length) {
			print("preloading next track")
			this.next_track_data = state.queue[state.queue_index + 1]
			this.next_track_audio = new Howl({
				src: "/get/" + this.next_track_data.track_id,
				format: formats,
				volume: this.volume,
			})
			this.add_event_listeners(this.next_track_audio)
		}
	}

	timeupdate_handler = async () => {
		let duration = state.current_track.length
		if (this.current_track_audio) {
			// @ts-ignore
			let current_time: number = this.current_track_audio.seek() || 0
			let progress = (current_time / duration) * 100
			let progres_bar: ProgressBar = this.el.querySelector("progress-bar")
			progres_bar.progress = progress
			progres_bar.current_time = current_time
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
		let currentIndex = this.ordered_queue.length,
			temporaryValue,
			randomIndex

		while (0 !== currentIndex) {
			randomIndex = Math.floor(Math.random() * currentIndex)
			currentIndex -= 1

			temporaryValue = this.ordered_queue[currentIndex]
			state.queue[currentIndex] = this.ordered_queue[randomIndex]
			state.queue[randomIndex] = temporaryValue
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
		Cookies.set("jukebox-volume", volume + "")
		this.current_track_audio?.volume(this.volume)
		this.next_track_audio?.volume(this.volume)
	}

	@Listen("keydown", {target: "document"})
	async space_handler(event: KeyboardEvent) {
		if (this.current_track_audio && event.code === "Space") {
			event.preventDefault()
			await this.toggle_playing()
		}
	}

	render() {
		let speaker_class = "speaker -on"
		if (this.volume === 0) {
			speaker_class = "speaker -off"
		}
		let wrapper_class = "volume_wrapper hidden"
		if (!this.volume_bar_hidden) {
			wrapper_class = "volume_wrapper showing"
		}
		let total_time = 0
		if (this.current_track_audio) {
			total_time = state.current_track.length
		}
		return (
			<Host class="player_controls_host">
				<div class="prev" onClick={this.play_previous_track.bind(this)} />
				<play-button
					paused={this.paused}
					toggle_playing={this.toggle_playing}
				/>
				<div class="next" onClick={this.play_next_track.bind(this)} />
				<track-stats />
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
				<progress-bar seek_handler={this.seek} total_time={total_time} />
			</Host>
		)
	}
}
