import {Injectable} from "@angular/core"
import {HttpClient} from "@angular/common/http"
import {Track} from "../models"
import {Observable} from "rxjs"
import {UserService} from "./user.service"

@Injectable({
	providedIn: "root",
})
export class TracksService {
	loved_tracks: number[] = []

	constructor(private http: HttpClient, private user_service: UserService) {}

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

	get_loved_tracks(): Observable<number[]> {
		return this.http.get<number[]>(
			`/love/track/${this.user_service.current_user.user_id}`,
		)
	}

	change_track_love(track_id: number, is_loved: boolean): Promise<string> {
		let url: string = `/love/track/${this.user_service.current_user.user_id}/${track_id}`
		let method = "PUT"
		if (!is_loved) {
			method = "DELETE"
			this.loved_tracks.splice(this.loved_tracks.indexOf(track_id), 1)
		} else {
			this.loved_tracks.push(track_id)
		}
		return fetch(url, {method: method}).then(response => {
			return response.text()
		})
	}
}
