import {Components} from "../components"
import PlayerControls = Components.PlayerControls
import {UAParser} from "ua-parser-js"

export let get_player_controls = async (): Promise<PlayerControls> => {
	await customElements.whenDefined("player-controls")
	return document.querySelector("player-controls")
}

export let ua_parser = new UAParser(navigator.userAgent)
