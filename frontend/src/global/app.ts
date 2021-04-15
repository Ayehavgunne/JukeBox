import {Components} from "../components"
import {UAParser} from "ua-parser-js"
import PlayerControls = Components.PlayerControls

export let get_player_controls = async (): Promise<PlayerControls> => {
	await customElements.whenDefined("player-controls")
	return document.querySelector("player-controls")
}

export let ua_parser = new UAParser(navigator.userAgent)

export let print = (...messages) => {
	console.log(...messages)
}
