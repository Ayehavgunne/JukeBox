import {Injectable} from "@angular/core"
import {HttpClient} from "@angular/common/http"
import {Track} from "../models"
import {Observable} from "rxjs"
import {print} from "../utils"

@Injectable({
	providedIn: "root",
})
export class TracksService {
	constructor(private http: HttpClient) {}

	get_tracks(album_id?: number): Observable<Track[]> {
		if (album_id) {
			return this.http.get<Track[]>(`albums/${album_id}/tracks`)
		}
		return this.http.get<Track[]>("/tracks")
	}

	get_track_audio(track_id: number): Promise<Blob> {
		return fetch(`/get/${track_id}`).then(response => {
			return response.blob()
		})
	}

	change_track_love(track_id: number, is_loved: boolean): Promise<string> {
		let url: string = "/love/tracks"
		let method = "PUT"
		if (!is_loved) {
			method = "DELETE"
		}
		return fetch(url, {method: method}).then(response => {
			return response.text()
		})
	}
}
