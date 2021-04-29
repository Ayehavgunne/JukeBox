import {Injectable} from "@angular/core"
import {Howl} from "howler"
import {Track} from "../models"
import {CookiesService} from "./cookies.service"
import {print} from "../utils"

const formats = ["m4a", "flac", "mp3"]

@Injectable({
	providedIn: "root",
})
export class PlayerService {
	current_track: Track
	private next_track_data: Track
	private queue: Track[] = []
	private ordered_queue: Track[] = []
	private queue_index: number = 0
	private current_track_audio?: Howl
	private next_track_audio?: Howl
	paused: boolean = true
	private nearing_track_end: boolean = false
	private is_shuffle: boolean = false
	private vol: number = 0.6

	constructor(private cookies_service: CookiesService) {
		let volume_cookie = this.cookies_service.get("jukebox-volume")
		let volume: number
		if (!volume_cookie) {
			volume = this.vol
			this.cookies_service.set("jukebox-volume", volume + "")
		} else {
			volume = parseFloat(volume_cookie)
		}
		this.vol = volume
	}

	play = (): void => {
		if (this.current_track_audio) {
			this.current_track_audio.play()
			this.paused = false
		}
	}

	play_previous_track = (): void => {
		if (this.current_track_audio) {
			if (this.current_track_audio.seek() > 1.5) {
				this.current_track_audio.seek(0)
			} else {
				this.change_to_track(this.queue_index - 1)
			}
		}
	}

	play_next_track(): void {
		if (this.current_track_audio) {
			// check if this.next_track has been loaded
			this.change_to_track(this.queue_index + 1)
		}
	}

	change_to_track = (track_index: number): void => {
		if (this.current_track_audio) {
			this.current_track_audio.stop()
			delete this.current_track_audio
		}
		if (track_index < this.queue.length) {
			this.queue_index = track_index
			this.current_track = this.queue[this.queue_index]
			this.current_track_audio = new Howl({
				src: "/stream/" + this.current_track.track_id,
				format: formats,
				volume: this.volume,
				html5: true,
			})
			document.title = this.current_track.title + " - JukeBox"
			this.add_event_listeners(this.current_track_audio)
			this.current_track_audio.play()
		} else {
			this.current_track = {
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
			// let progres_bar: ProgressBar = this.el.querySelector("progress-bar")
			// progres_bar.progress = 0
			// progres_bar.current_time = 0
		}
	}

	pause = (): void => {
		if (this.current_track_audio) {
			this.current_track_audio.pause()
			this.paused = true
		}
	}

	set_track = (track: Track): void => {
		if (this.current_track_audio) {
			this.current_track_audio.stop()
			delete this.current_track_audio
		}
		this.current_track_audio = new Howl({
			src: "/stream/" + track.track_id,
			format: formats,
			volume: this.vol,
			html5: true,
		})
		this.add_event_listeners(this.current_track_audio)
	}

	set_queue = (tracks: Track[]): void => {
		this.queue = tracks
		this.ordered_queue = tracks
		this.queue_index = this.queue.indexOf(this.current_track)
	}

	add_next_in_queue = (track: Track): void => {
		this.queue.splice(this.queue_index + 1, 0, track)
		this.ordered_queue.splice(this.queue_index + 1, 0, track)
	}

	append_to_queue = (tracks: Track[]): void => {
		this.queue.concat(tracks)
		this.ordered_queue.concat(tracks)
	}

	get seek(): number {
		// @ts-ignore
		return this.current_track_audio?.seek() || 0
	}

	set seek(percent: number) {
		if (this.current_track_audio) {
			this.current_track_audio.seek((percent / 100) * this.current_track.length)
		}
	}

	get total_time(): number {
		return this.current_track.length
	}

	play_handler = (): void => {
		this.paused = false
	}

	pause_handler = (): void => {
		this.paused = true
	}

	track_done = (): void => {
		this.nearing_track_end = false
		this.auto_change_to_next_track()
	}

	auto_change_to_next_track = (): void => {
		// this.playlist_index = // loops index around when out of bounds
		// 	(this.playlist_index + 1 + this.playlist.length) % this.playlist.length
		this.queue_index += 1
		if (this.queue_index < this.queue.length) {
			this.current_track_audio = this.next_track_audio
			delete this.next_track_audio
			this.play()
			this.current_track = this.queue[this.queue_index]
			document.title = this.current_track.title + " - JukeBox"
		}
	}

	toggle_playing = (): void => {
		if (this.paused) {
			this.play()
		} else {
			this.pause()
		}
	}

	toggle_shuffle = (): void => {
		this.is_shuffle = !this.is_shuffle
		if (this.is_shuffle) {
			this.shuffle_playlist()
		} else {
			this.queue = this.ordered_queue
		}
	}

	preload_next_track = (): void => {
		if (this.queue_index + 1 < this.queue.length) {
			print("preloading next track")
			this.next_track_data = this.queue[this.queue_index + 1]
			this.next_track_audio = new Howl({
				src: "/get/" + this.next_track_data.track_id,
				format: formats,
				volume: this.volume,
			})
			this.add_event_listeners(this.next_track_audio)
		}
	}

	shuffle_playlist = (): void => {
		let currentIndex = this.ordered_queue.length,
			temporaryValue,
			randomIndex

		while (0 !== currentIndex) {
			randomIndex = Math.floor(Math.random() * currentIndex)
			currentIndex -= 1

			temporaryValue = this.ordered_queue[currentIndex]
			this.queue[currentIndex] = this.ordered_queue[randomIndex]
			this.queue[randomIndex] = temporaryValue
		}
	}

	add_event_listeners = (audio: Howl) => {
		audio.on("play", this.play_handler)
		audio.on("pause", this.pause_handler)
		audio.on("end", this.track_done)
		// @ts-ignore
		let node = audio._sounds[0]._node
		node.onpause = () => {
			this.pause_handler()
		}
		node.onplaying = () => {
			this.play_handler()
		}
	}

	get volume(): number {
		return this.vol
	}

	set volume(vol: number) {
		this.vol = vol
	}
}
