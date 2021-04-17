import {Components} from "../components"
import {UAParser} from "ua-parser-js"
import PlayerControls = Components.PlayerControls
import state from "./store"

export let get_player_controls = async (): Promise<PlayerControls> => {
	await customElements.whenDefined("player-controls")
	return document.querySelector("player-controls")
}

export let ua_parser = new UAParser(navigator.userAgent)

export let print = (...messages) => {
	console.log(...messages)
}


fetch("/assets/generic_album.png")
	.then(response => {
		return response.blob()
	})
	.then(blob => {
		let reader = new FileReader()
		reader.onload = function () {
			state.images["/assets/generic_album.png"] = this.result.toString()
		}
		reader.readAsDataURL(blob)
	})
fetch("/assets/generic_artist.png")
	.then(response => {
		return response.blob()
	})
	.then(blob => {
		let reader = new FileReader()
		reader.onload = function () {
			state.images["/assets/generic_artist.png"] = this.result.toString()
		}
		reader.readAsDataURL(blob)
	})
