import {createStore} from "@stencil/store"

const {state} = createStore({
	playlist_names: [],
	current_track: {
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
	},
	images: {},
	user: {
		user_id: 0,
		username: "",
	},
})

export default state
