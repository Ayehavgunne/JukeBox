import {Injectable} from "@angular/core"
import {Observable, Subject} from "rxjs"
import {DatePipe} from "@angular/common"
import {Track} from "../models"
import {CookiesService} from "./cookies.service"
import {TracksService} from "./tracks.service"
import {print} from "../utils"

@Injectable({
	providedIn: "root",
})
export class PlayerService {
	track?: Track
	paused: boolean = true
	percent_complete: number = 0
	queue: Track[] = []
	private subject = new Subject<Track>()
	private ordered_queue: Track[] = []
	private queue_index: number = 0
	private audio: HTMLAudioElement = new Audio()
	private preloaded_audio?: Blob
	private nearing_track_end: boolean = false
	private is_shuffle: boolean = false
	private vol: number = 0.6

	constructor(
		private cookies_service: CookiesService,
		private tracks_service: TracksService,
		private date_pipe: DatePipe,
	) {
		let volume_cookie = this.cookies_service.get("jukebox-volume")
		let volume: number
		if (!volume_cookie) {
			volume = this.vol
			this.cookies_service.set("jukebox-volume", volume + "")
		} else {
			volume = parseFloat(volume_cookie)
		}
		this.vol = volume
		this.audio.volume = volume
		this.add_event_listeners(this.audio)
	}

	add_source(track: Track) {
		if (this.preloaded_audio) {
			this.audio.src = URL.createObjectURL(this.preloaded_audio)
		} else {
			this.audio.src = `/stream/${track.track_id}`
		}
		this.play()
	}

	async load_audio(track: Track): Promise<void> {
		this.preloaded_audio = await this.tracks_service.get_track_audio(track.track_id)
	}

	play = (track?: Track): void => {
		if (track) {
			this.audio.pause()
			this.track = track
			if (this.queue) {
				this.queue_index = this.queue.indexOf(this.track)
			}
			this.subject.next(track)
			document.title = this.track.title + " - JukeBox"
			this.preloaded_audio = undefined
			this.add_source(track)
		} else {
			this.audio.play().then()
		}
		this.paused = false
	}

	pause = (): void => {
		this.audio.pause()
		this.paused = true
	}

	play_previous_track = (): void => {
		if (this.track) {
			if (this.seek > 1.5) {
				this.seek = 0
			} else {
				this.change_to_track(this.queue_index - 1)
			}
		}
	}

	play_next_track = (): void => {
		if (this.track) {
			// check if next track has been loaded
			this.change_to_track(this.queue_index + 1)
		}
	}

	change_to_track = (track_index: number): void => {
		this.audio.pause()
		if (track_index < this.queue.length) {
			this.queue_index = track_index
			this.track = this.queue[this.queue_index]
			this.preloaded_audio = undefined
			this.add_source(this.track)
			document.title = this.track.title + " - JukeBox"
		} else {
			this.track = undefined
		}
		this.subject.next(this.track)
	}

	watch_track(): Observable<Track> {
		return this.subject.asObservable()
	}

	set_queue = (tracks: Track[]): void => {
		this.queue = tracks
		this.ordered_queue = tracks
		if (this.track) {
			this.queue_index = this.queue.indexOf(this.track)
		}
	}

	add_next_in_queue = (track: Track): void => {
		this.queue.splice(this.queue_index + 1, 0, track)
		this.ordered_queue.splice(this.queue_index + 1, 0, track)
	}

	append_to_queue = (tracks: Track[]): void => {
		this.queue.concat(tracks)
		this.ordered_queue.concat(tracks)
	}

	current_time(): string {
		return (
			this.date_pipe.transform((this.audio.currentTime || 0) * 1000, "mm:ss") ||
			""
		)
	}

	get seek(): number {
		return this.audio.currentTime || 0
	}

	set seek(time: number) {
		this.audio.currentTime = time
	}

	seek_percent(percent: number) {
		if (this.track) {
			this.audio.currentTime = (percent / 100) * this.track.length
		}
	}

	get total_time(): number {
		if (this.track) {
			return this.track.length
		} else {
			return 0
		}
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
			this.track = this.queue[this.queue_index]
			this.subject.next(this.track)
			document.title = this.track.title + " - JukeBox"
			this.add_source(this.track)
			this.play()
			this.preload_next_track()
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
			this.load_audio(this.queue[this.queue_index + 1]).then()
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

	timeupdate_handler = () => {
		this.percent_complete = (this.seek / this.total_time) * 100
	}

	add_event_listeners = (audio: HTMLAudioElement) => {
		audio.removeEventListener("play", this.play_handler)
		audio.addEventListener("play", this.play_handler)
		audio.removeEventListener("pause", this.pause_handler)
		audio.addEventListener("pause", this.pause_handler)
		audio.removeEventListener("ended", this.track_done)
		audio.addEventListener("ended", this.track_done)
		audio.removeEventListener("loadeddata", this.preload_next_track)
		audio.addEventListener("loadeddata", this.preload_next_track)
		audio.removeEventListener("timeupdate", this.timeupdate_handler)
		audio.addEventListener("timeupdate", this.timeupdate_handler)
	}

	get volume(): number {
		return this.vol
	}

	set volume(vol: number) {
		this.vol = vol
		this.audio.volume = vol
		this.cookies_service.set("jukebox-volume", vol + "")
	}
}
