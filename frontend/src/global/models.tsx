export interface Track {
	track_id: number
	title: string
	album: string
	album_id: number
	album_disc: number
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
	total_discs: number
	year: number
}

export interface AlbumDisc {
	album_disc_id: number
	album: string
	album_id: number
	disc_number: number
	total_tracks: number
}

export interface Artist {
	artist_id: number
	name: string
}

export interface User {
	user_id: number
	username: string
}

export interface Playlist {
	playlist_name: string
	user: User
}
