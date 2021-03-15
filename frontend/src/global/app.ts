import {Components} from "../components"
import PlayerControls = Components.PlayerControls

export default async () => {
	/**
	 * The code to be executed should be placed within a default function that is
	 * exported by the global script. Ensure all of the code in the global script
	 * is wrapped in the function() that is exported.
	 */
}
export let get_player_controls = async (): Promise<PlayerControls> => {
	await customElements.whenDefined("player-controls")
	return document.querySelector("player-controls")
}
