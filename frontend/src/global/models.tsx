export interface Track {
	track_id: number
	title: string
	album: string
	artist: string
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
	artist: string
	total_tracks: number
	disc_number: number
	total_discs: number
	year: number
}

export interface Artist {
	artist_id: number
	name: string
}

export interface Playlist {
	playlist_name: string
	track_id: number
	user_id: number
}

export interface User {
	user_id: number
	username: string
}
