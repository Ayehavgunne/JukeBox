import {InjectionToken} from "@angular/core"

export interface Track {
	track_id: number
	title: string
	album: string
	album_id: number
	album_disc: number
	artist: string
	artist_id: number
	track_number: number
	disc_number: number
	year: number
	genre: string
	compilation: string
	length: number
	mimetype: string
	codec: string
	bitrate: number
	size: number
}

export interface Album {
	album_id: number
	title: string
	total_discs: number
	year: number
}

// export interface AlbumDisc {
// 	album_disc_id: number
// 	album: string
// 	album_id: number
// 	disc_number: number
// 	total_tracks: number
// }

export interface Artist {
	artist_id: number
	name: string
}

export interface UserSettings {
	theme_name: string
	primary_color: string
}

export interface User {
	user_id: number
	username: string
	settings: UserSettings
}

export interface UserQueryResponse {
	error: string
	user_id: number
	username: string
	settings: UserSettings
}

// export interface Playlist {
// 	playlist_name: string
// 	user: User
// }

export class ModalConfig {
	modal_title: string = "Hello"
	dismiss_button_label: string = "Cancel"
	accept_button_label: string = "Okay"
	show_input: boolean = true
	show_dismiss_button: boolean = true
	on_accept(): Promise<boolean> | boolean {
		return true
	}
	on_dismiss(): Promise<boolean> | boolean {
		return false
	}
	on_input_change(new_value: string): Promise<string> | string {
		return new_value
	}
}

export class ModalResponse {
	accepted: boolean
	input: string
	constructor(accepted: boolean, input: string) {
		this.accepted = accepted
		this.input = input
	}
}

export const THEMES = new InjectionToken("THEMES")
export const ACTIVE_THEME = new InjectionToken("ACTIVE_THEME")

export interface Theme {
	name: string
	properties: any
}

export interface ThemeOptions {
	themes: Theme[]
	active: string
}
