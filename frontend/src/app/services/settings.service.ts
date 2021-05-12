import {Injectable} from "@angular/core"

@Injectable({
	providedIn: "root",
})
export class SettingsService {
	constructor() {}

	scan_files = async () => {
		await fetch("/task/scan_files")
	}
	get_artist_images = async () => {
		await fetch("/task/get_artist_images")
	}
}
